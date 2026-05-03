# Testing configuration

```mermaid
flowchart LR
  classDef serviceClass fill:#bfb
  classDef dbClass fill:#8df
  classDef userClass fill:#fcc
  classDef ingressClass fill:#ffa
  classDef podClass fill:#edf
  classDef secretClass fill:#fda
  classDef containerClass fill:#eee
  subgraph cluster
    direction LR
    subgraph frontend-deployment[deployment chiller_frontend]
      frontend-pod-1[pod chiller_frontend]
      frontend-pod-n[pod chiller_frontend]
    end
    subgraph api-deployment[deployment chiller_api]
      api-pod-1[pod chiller_api]
      api-pod-n[pod chiller_api]
    end
    subgraph sim-user-deployment[deployment sim_user]
      sim-user-pod-1[pod sim_user]
      sim-user-pod-n[pod sim_user]
    end
    subgraph db-pod[pod postgres]
      subgraph db-container[postgres:16.3-alpine]
        postgres[[postgres]] --> db-file[(temp DB)]:::dbClass
      end
      db-container --- db-secret1[/secret db_auth/]
      db-container --- db-schema[/configMap schema.sql/]
    end
    subgraph api-pod-1[pod chiller_api]
      api-container[chiller_api:latest] --- db-secret2[/secret db_auth/]
    end
    subgraph api-pod-n[pod chiller_api]
      api-container2[chiller_api:latest] --- db-secret3[/secret db_auth/]
    end    
    frontend-service[svc chiller_frontend]:::serviceClass --> frontend-pod-1 & frontend-pod-n -->
    api-service[svc chiller_api]:::serviceClass --> api-pod-1 & api-pod-n --> db-service[svc chiller_postgres]:::serviceClass --> db-pod
  end
  sim-user-pod-1 & sim-user-pod-n --> frontend-service
  class db-pod,api-pod-1,api-pod-n,frontend-pod-1,frontend-pod-n,sim-user-pod-1,sim-user-pod-n podClass
  class db-secret1,db-secret2,db-secret3,db-schema secretClass
  class db-container,api-container,api-container2 containerClass
```

Internal images are tagged by the commit hash (if generated on-demand) or the RC version tag (if generated as part of a pull request to main).

## Deployments

### chiller_frontend
- replicas: 2
- image: chiller_frontend

### chiller_api
- replicas: 2
- image: chiller_api

### sim_user
- replicas: 2+
- image: sim_user

## Pods

### postgres
- image: postgres:16.3-alpine
- secret: db_auth

The database is in a single pod.  For testing, the database files are ephemeral and located inside the container image.  The secret is for the username and password to access the database.

## Services

### chiller_frontend
Exposes chiller_frontend deployment

### chiller_api
Exposes chiller_api deployment

### postgres
Exposes postgres pod

## Secrets

### db_auth
- PGUSER: postgres
- PGPASSWORD: random alphanumeric string 24 characters

# Production configuration

WORK IN PROGRESS

```mermaid
flowchart LR
  classDef serviceClass fill:#bfb
  classDef dbClass fill:#8df
  classDef userClass fill:#fcc
  classDef ingressClass fill:#ffa
  classDef podClass fill:#edf
  classDef secretClass fill:#fda
  classDef containerClass fill:#eee
  subgraph cluster
    direction LR
    subgraph frontend-deployment
      frontend-pod-1
      frontend-pod-n
    end
    subgraph api-deployment
      api-pod-1
      api-pod-n
    end
    subgraph db-pod
      db-container --- db-secret1[/db-secret/]
      db-container --> db-file[(DB-PVC)]:::dbClass
    end
    subgraph api-pod-1
      api-container --- db-secret2[/db-secret/]
    end
    subgraph api-pod-n
      api-container2[api-container] --- db-secret3[/db-secret/]
    end
    ingress:::ingressClass --> frontend-service:::serviceClass --> frontend-pod-1 & frontend-pod-n -->
    api-service:::serviceClass --> api-pod-1 & api-pod-n --> db-service:::serviceClass --> db-pod
  end
  class db-pod,api-pod-1,api-pod-n,frontend-pod-1,frontend-pod-n podClass
  class db-secret1,db-secret2,db-secret3 secretClass
  class db-container,api-container,api-container2 containerClass
  user((user)):::userClass --> ingress
```
