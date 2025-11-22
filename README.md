# Système de Gestion de Livraisons

Architecture de microservices orientée événements utilisant Apache Kafka, NestJS et Next.js.

## Vue d'Ensemble de l'Architecture

Ce projet démontre une architecture distribuée orientée événements avec les composants suivants :

### Microservices

1. **Service de Commandes** (Producteur)
   * Port : 3001
   * Publie : événements `order.created` sur le topic `orders`
   * Technologie : NestJS + Kafka
2. **Service de Livraison** (Consommateur + Producteur)
   * Port : 3002
   * Consomme : `order.created` depuis le topic `orders`
   * Publie : `delivery.started` et `delivery.completed` sur le topic `deliveries`
   * Technologie : NestJS + Kafka
3. **Service de Suivi** (Consommateur)
   * Port : 3003
   * Consomme : `delivery.started` et `delivery.completed` depuis le topic `deliveries`
   * Persiste : Statut de livraison dans MongoDB
   * Technologie : NestJS + Kafka + MongoDB
4. **Service de Notification** (Consommateur)
   * Port : 3004
   * Consomme : `delivery.completed` depuis le topic `deliveries`
   * Action : Envoie des notifications (simulées)
   * Technologie : NestJS + Kafka

### Infrastructure

* **Kafka** : Broker de messages (Port : 9092)
* **Zookeeper** : Coordination Kafka (Port : 2181)
* **MongoDB** : Stockage persistant (Port : 27017)
* **Kafka UI** : Interface de visualisation Kafka (Port : 8080)
* **Frontend** : Application web Next.js (Port : 3000)

### Topics Kafka

* `orders` : Événements de création de commande
* `deliveries` : Événements du cycle de vie de livraison

## Flux d'Événements

```
[Frontend] → POST /orders
     ↓
[Service de Commandes] → publie order.created
     ↓
[Topic Kafka: orders]
     ↓
[Service de Livraison] → consomme order.created
     ↓              → publie delivery.started
     ↓              → (délai de 5 sec)
     ↓              → publie delivery.completed
     ↓
[Topic Kafka: deliveries]
     ↓                    ↓
[Service de Suivi]  [Service de Notification]
     ↓                    ↓
[Mise à jour MongoDB]    [Envoi Notification]
```

## Validation des Exigences Académiques

* **2+ Producteurs** : Service de Commandes, Service de Livraison
* **3 Consommateurs** : Service de Livraison, Service de Suivi, Service de Notification
* **2+ Topics** : orders, deliveries
* **Déclenchement Manuel** : Bouton interface web + API REST
* **Réactions Observables** : Mises à jour MongoDB, logs console, notifications

## Prérequis

* Docker Desktop ou Docker Engine
* Docker Compose
* 8GB RAM minimum
* Ports disponibles : 3000, 3001, 3002, 3003, 3004, 8080, 9092, 27017, 2181

## Installation et Configuration

### 1. Cloner le dépôt

```bash
git clone <repository-url>
cd delivery-management-system
```

### 2. Configurer les variables d'environnement

Chaque service possède un fichier `.env.example`. Créez les fichiers `.env` à partir de ces exemples :

```bash
# Services backend
cp services/order-service/.env.example services/order-service/.env
cp services/delivery-service/.env.example services/delivery-service/.env
cp services/tracking-service/.env.example services/tracking-service/.env
cp services/notification-service/.env.example services/notification-service/.env

# Frontend
cp frontend/.env.example frontend/.env
```

**Note :** Les fichiers `.env` sont déjà configurés pour fonctionner avec Docker Compose. Si vous exécutez les services localement (sans Docker), vous devrez peut-être ajuster les URLs (remplacer `localhost` par les URLs appropriées).

### 3. Démarrer tous les services

```bash
docker-compose up --build
```

Cette commande va :

* Construire toutes les images Docker
* Démarrer Kafka, Zookeeper, MongoDB, Kafka UI
* Démarrer les 4 microservices
* Démarrer l'application frontend

### 4. Attendre que les services soient prêts

Attendre environ 30-60 secondes pour que tous les services s'initialisent. Surveiller les logs pour :

* Confirmations de connexion Kafka
* Succès de connexion MongoDB
* Tous les services rapportant "running"

## Utilisation

### Accéder à l'Application

**Interface Web :**
```
http://localhost:3000
```

**Kafka UI (Visualisation des événements) :**
```
http://localhost:8080
```

Dans Kafka UI, vous pouvez :
* Visualiser les topics (`orders`, `deliveries`)
* Voir les messages en temps réel
* Examiner les consumer groups
* Surveiller les offsets et partitions

### Créer une Commande

1. Entrez le nom du client (ex. "Jean Dupont")
2. Entrez les articles séparés par des virgules (ex. "Ordinateur portable, Souris, Clavier")
3. Cliquez sur "Créer une Commande"
4. Observez la confirmation de création de commande

### Surveiller le Flux d'Événements

**Option 1 : Kafka UI (Recommandé)**

Accédez à `http://localhost:8080` pour visualiser les événements Kafka en temps réel :
* Naviguez vers "Topics" pour voir les topics `orders` et `deliveries`
* Cliquez sur un topic pour voir les messages
* Les messages s'affichent en temps réel avec leur contenu JSON

**Option 2 : Logs Docker**

Ouvrez un nouveau terminal et exécutez :

```bash
docker-compose logs -f
```

Ou surveillez des services spécifiques :

```bash
# Surveiller la création de commandes
docker-compose logs -f order-service

# Surveiller le traitement des livraisons
docker-compose logs -f delivery-service

# Surveiller les mises à jour de suivi
docker-compose logs -f tracking-service

# Surveiller les notifications
docker-compose logs -f notification-service
```

### Vérifier les Données MongoDB

Connectez-vous à MongoDB :

```bash
docker exec -it mongodb mongosh -u admin -p admin123

use delivery_tracking
db.deliveries.find().pretty()
```

## Points d'Accès API

### Service de Commandes

* `POST http://localhost:3001/orders`
  ```json
  {
    "customerName": "Jean Dupont",
    "customerEmail": "jean.dupont@example.com",
    "items": ["Ordinateur portable", "Souris", "Clavier"]
  }
  ```
* `GET http://localhost:3001/orders`
  * Retourne le statut du service

### Service de Suivi

* `GET http://localhost:3003/tracking`
  * Retourne toutes les livraisons
* `GET http://localhost:3003/tracking/:deliveryId`
  * Retourne une livraison par ID
* `GET http://localhost:3003/tracking/order/:orderId`
  * Retourne une livraison par ID de commande

## Structure du Projet

```
delivery-management-system/
├── docker-compose.yml
├── README.md
├── services/
│   ├── order-service/
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── delivery-service/
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── tracking-service/
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── notification-service/
│       ├── src/
│       ├── package.json
│       └── Dockerfile
└── frontend/
    ├── src/
    ├── package.json
    └── Dockerfile
```

## Pile Technologique

### Backend

* **NestJS** : Framework TypeScript pour construire des applications serveur scalables
* **KafkaJS** : Client Apache Kafka moderne pour Node.js
* **Mongoose** : Modélisation d'objets MongoDB pour Node.js

### Frontend

* **Next.js 14** : Framework React avec App Router
* **React 18** : Bibliothèque UI
* **Tailwind CSS** : Framework CSS utilitaire

### Infrastructure

* **Apache Kafka** : Plateforme de streaming d'événements distribuée
* **Zookeeper** : Service de coordination pour Kafka
* **MongoDB** : Base de données NoSQL
* **Docker** : Plateforme de conteneurisation

## Développement

### Exécuter les services individuellement (sans Docker)

#### 1. Configurer les variables d'environnement

Assurez-vous d'avoir créé les fichiers `.env` à partir des `.env.example` (voir section Installation).

**Important :** Pour l'exécution locale, vous devrez peut-être modifier les URLs dans les fichiers `.env` :
- `KAFKA_BROKER=localhost:9092` (au lieu de `kafka:29092`)
- `MONGODB_URI=mongodb://admin:admin123@localhost:27017/...` (au lieu de `mongodb:27017`)
- `TRACKING_SERVICE_URL=http://localhost:3003` (au lieu de `http://tracking-service:3003`)

#### 2. Démarrer Kafka, MongoDB et Kafka UI

```bash
docker-compose up zookeeper kafka mongodb kafka-ui
```

#### 3. Installer les dépendances

```bash
cd services/order-service && npm install
cd services/delivery-service && npm install
cd services/tracking-service && npm install
cd services/notification-service && npm install
cd frontend && npm install
```

#### 4. Exécuter les services

```bash
# Terminal 1
cd services/order-service && npm run start:dev

# Terminal 2
cd services/delivery-service && npm run start:dev

# Terminal 3
cd services/tracking-service && npm run start:dev

# Terminal 4
cd services/notification-service && npm run start:dev

# Terminal 5
cd frontend && npm run dev
```

## Dépannage

### Les services ne se connectent pas à Kafka

Attendez que Kafka soit complètement prêt. Vérifiez les logs :

```bash
docker-compose logs kafka
```

### Conflits de ports

Si les ports sont déjà utilisés, modifiez les ports dans `docker-compose.yml`

### Problèmes de connexion MongoDB

Assurez-vous que MongoDB est sain :

```bash
docker-compose ps mongodb
```

### Redémarrage propre

```bash
docker-compose down -v
docker-compose up --build
```

## Arrêter l'Application

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (état propre)
docker-compose down -v
```

## Documentation Académique

### Diagramme d'Architecture

Le système suit une architecture de microservices orientée événements où :

* Les services communiquent de manière asynchrone via Kafka
* Chaque service a une responsabilité unique
* Les événements sont immuables et stockés dans les topics Kafka
* Les services peuvent être mis à l'échelle indépendamment

### Décisions de Conception

1. **Architecture Orientée Événements** : Choisie pour le découplage et la scalabilité
2. **Kafka** : Sélectionné pour la livraison fiable de messages et la capacité de relecture d'événements
3. **NestJS** : Fournit une structure et l'injection de dépendances pour un code maintenable
4. **MongoDB** : Adapté pour un schéma flexible et des écritures rapides pour les données de suivi
5. **Docker Compose** : Simplifie le développement local et assure des environnements cohérents

## Auteur

Projet Académique - Architecture Orientée Événements avec Kafka
