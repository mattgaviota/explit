# Docker Release - Instrucciones

## Cómo usar el artifact Docker en Azure Releases

### Paso 1: Descargar el artifact en el Release

En tu **Release Pipeline**, agrega un paso para descargar el artifact:

```yaml
- task: DownloadBuildArtifacts@0
  displayName: 'Download Docker Image Artifact'
  inputs:
    buildType: 'current'
    downloadType: 'single'
    artifactName: 'docker-image-$(Build.BuildId)'
    downloadPath: '$(System.ArtifactsDirectory)'
```

O en la UI de Releases:
1. Agrega un artifact (Build)
2. Selecciona el proyecto y la rama
3. Artifact name: `docker-image-*`

### Paso 2: Descomprimir la imagen

```bash
cd $(System.ArtifactsDirectory)/docker-image-$(Build.BuildId)
gunzip explit-$(Build.BuildId).tar.gz
```

### Paso 3: Cargar la imagen en Docker

```bash
docker load -i explit-$(Build.BuildId).tar
```

### Paso 4: Usar la imagen

#### Opción A: Push a ACR (Azure Container Registry)

```bash
docker tag explit:$(Build.BuildId) nuntius.azurecr.io/split/explit:$(Build.BuildId)
docker tag explit:$(Build.BuildId) nuntius.azurecr.io/split/explit:latest

docker push nuntius.azurecr.io/split/explit:$(Build.BuildId)
docker push nuntius.azurecr.io/split/explit:latest
```

#### Opción B: Ejecutar localmente

```bash
docker run -p 3000:3000 explit:$(Build.BuildId)
```

#### Opción C: Desplegar a Azure Container Instances (ACI)

```bash
az container create \
  --resource-group <your-rg> \
  --name explit-$(Build.BuildId) \
  --image explit:$(Build.BuildId) \
  --ports 3000 \
  --environment-variables \
    PORT=3000
```

#### Opción D: Desplegar a App Service (Docker container)

En el Release, agrega un paso:

```yaml
- task: AzureWebAppContainer@1
  displayName: 'Deploy to App Service'
  inputs:
    azureSubscription: '<your-subscription>'
    appName: '<your-app-name>'
    containers: |
      nuntius.azurecr.io/split/explit:$(Build.BuildId)
    imagePullSecret: '<your-acr-username>'
```

### Script Completo para Release

```bash
#!/bin/bash
set -e

ARTIFACT_PATH="$(System.ArtifactsDirectory)/docker-image-$(Build.BuildId)"
IMAGE_NAME="explit"
IMAGE_TAG="$(Build.BuildId)"
REGISTRY="nuntius.azurecr.io"
REGISTRY_IMAGE="${REGISTRY}/split/${IMAGE_NAME}:${IMAGE_TAG}"

echo "=== Explit Docker Release ==="
echo "Artifact Path: $ARTIFACT_PATH"
echo "Image Name: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

# 1. Descomprimir
echo "1. Descomprimiendo imagen Docker..."
cd $ARTIFACT_PATH
gunzip ${IMAGE_NAME}-${IMAGE_TAG}.tar.gz

# 2. Cargar imagen
echo "2. Cargando imagen en Docker..."
docker load -i ${IMAGE_NAME}-${IMAGE_TAG}.tar

# 3. Verificar imagen
echo "3. Verificando imagen..."
docker images | grep $IMAGE_NAME

# 4. Tag para registry
echo "4. Tagueando imagen para registry..."
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY_IMAGE}
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/split/${IMAGE_NAME}:latest

# 5. Login a ACR (necesitas credenciales)
echo "5. Autenticando con Azure Container Registry..."
az acr login --name nuntius

# 6. Push a ACR
echo "6. Subiendo imagen a ACR..."
docker push ${REGISTRY_IMAGE}
docker push ${REGISTRY}/split/${IMAGE_NAME}:latest

echo ""
echo "=== Deploy Completado ==="
echo "Imagen disponible en: ${REGISTRY_IMAGE}"
echo "También disponible como: ${REGISTRY}/split/${IMAGE_NAME}:latest"
```

## Ventajas de este enfoque

✅ **Separación de Build y Deploy**: El build genera el artifact, el release lo consume
✅ **Control de versiones**: Cada imagen está versionada con el Build ID
✅ **Seguridad**: Las variables secretas se usan en Build, no en Release
✅ **Flexibilidad**: Puedes usar la imagen de múltiples formas (ACR, ACI, AppService, etc.)
✅ **Compresión**: Las imágenes comprimidas ahorran ancho de banda

## Metadata

El artifact incluye un archivo `image-metadata.json` con información útil:

```json
{
  "imageName": "explit",
  "imageTag": "123",
  "buildId": "123",
  "sourceVersion": "commit-hash",
  "repository": "split",
  "branch": "main"
}
```

Puedes usarlo en scripts de Release para documentar qué se desplegó.

## Ejemplo de Release Pipeline YAML

```yaml
trigger: none  # Solo se dispara desde Build

resources:
  pipelines:
    - pipeline: Build
      source: 'explit-build'
      trigger:
        branches:
          - main

stages:
  - stage: Deploy
    displayName: 'Deploy to Production'
    jobs:
      - deployment: DeployDocker
        displayName: 'Deploy Docker Image'
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - download: Build
                  displayName: 'Download Artifact'

                - script: |
                    cd $(Pipeline.Workspace)/Build/docker-image-*/
                    gunzip explit-*.tar.gz
                    docker load -i explit-*.tar
                  displayName: 'Load Docker Image'

                - script: |
                    docker tag explit:* nuntius.azurecr.io/split/explit:latest
                    az acr login --name nuntius
                    docker push nuntius.azurecr.io/split/explit:latest
                  displayName: 'Push to ACR'
```
