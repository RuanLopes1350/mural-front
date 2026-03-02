# Deploy Frontend - IFRO Events

## Build e Push da Imagem

```bash
cd /home/eduardo_tartas/Documentos/plataforma-de-divulgacao-de-eventos-front

docker build --build-arg NEXT_PUBLIC_API_URL=https://api-ifroevents.app.fslab.dev -t eduardotartas/front-ifroevents:latest .

docker push eduardotartas/front-ifroevents:latest
```

## Deploy no Kubernetes

```bash
kubectl apply -f deploy/front-configmap.yaml

kubectl apply -f deploy/deploy-front.yaml
```

## Remover Deploy

```bash
kubectl delete -f deploy/deploy-front.yaml

kubectl delete -f deploy/front-configmap.yaml
```

## Verificar Status

```bash
kubectl get pods | grep front-ifroevents

kubectl logs -f deployment/front-ifroevents
```

## URL de Acesso

https://ifroevents.app.fslab.dev
