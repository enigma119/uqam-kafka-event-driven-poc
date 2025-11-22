# Système de Gestion de Livraisons - Architecture Orientée Événements

---

## 🎯 1. Introduction

Notre projet démontre un système de gestion de livraisons basé sur des microservices qui communiquent de manière asynchrone via Kafka. Cette architecture permet une scalabilité et un découplage entre les services, répondant parfaitement aux exigences académiques.

---

## 📐 2. Architecture et Conformité

## **Notre système comprend 4 microservices :**

1. **Service de Commandes** - Producteur qui publie `order.created` sur le topic `orders`
2. **Service de Livraison** - Consommateur et Producteur : consomme `order.created`, publie `delivery.started` et `delivery.completed` sur le topic `deliveries`
3. **Service de Suivi** - Consommateur qui persiste les statuts dans MongoDB
4. **Service de Notification** - Consommateur qui envoie des notifications

**Conformité aux exigences :**

- ✅ **2+ Producteurs** : Services de Commandes et Livraison
- ✅ **3 Consommateurs** : Services de Livraison, Suivi et Notification
- ✅ **2 Topics Kafka** : `orders` et `deliveries`
- ✅ **Déclenchement manuel** : Interface web + API REST
- ✅ **Réactions observables** : MongoDB, logs, notifications, Kafka UI

**Flux :** Interface web → Service Commandes → Kafka `orders` → Service Livraison → Kafka `deliveries` → Services Suivi et Notification en parallèle.

---

## 🎬 3. Démonstration Live 

**Étape 1 - Création de commande :**

Création d'une commande via l'interface web. Vous voyez immédiatement la confirmation.

**Étape 2 - Visualisation Kafka UI :**
Dans Kafka UI à `http://localhost:8080`, observez :

- L'événement `order.created` apparaître dans le topic `orders` avec son contenu JSON
- Puis l'événement `delivery.started` dans le topic `deliveries`
- Et après 5 secondes, `delivery.completed`

**Étape 3 - Visualisation Frontend :**
L'interface web se met à jour automatiquement toutes les 2 secondes, affichant les statuts de livraison depuis MongoDB.

**Étape 4 - Logs :**
Les logs montrent clairement le flux : "Event published", "Event received", "Delivery status updated", "Notification sent".

**Points clés :** Communication asynchrone, découplage total, persistance observable, traçabilité complète.

---

## 🛠️ 4. Stack Technique 

**Backend :** NestJS avec TypeScript, KafkaJS, Mongoose pour MongoDB

**Frontend :** Next.js 14 avec React et Tailwind CSS

**Infrastructure :** Docker Compose, Kafka UI pour visualisation

**Déploiement :** Une seule commande `docker-compose up` démarre tout le système.

---

## 🎓 5. Conclusion

**Ce projet démontre efficacement :**

- Une architecture event-driven fonctionnelle avec Kafka
- La séparation des responsabilités entre microservices
- La scalabilité et le découplage offerts par cette approche
- Des réactions observables claires à chaque étape

**Avantages :** Services indépendants, communication asynchrone fiable, traçabilité complète, facilement extensible.
