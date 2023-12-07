# Mon Expérience chez Winamax France

Suite à une opportunité, j'ai décidé de postuler chez Winamax France. Ils m'ont soumis un exercice pour évaluer mes compétences. J'ai abordé cet exercice avec enthousiasme et quelques bonus ont été inclus. Le projet complet a nécessité environ une dizaine d'heures pour être réalisé.

Le projet final consiste en une simulation de plateforme de paris, hébergée via Node.js, Socket.io, Redis, MongoDB, et AWS Lambda. Ce projet s'est avéré être un défi passionnant, et j'aimerais l'ajouter à mon portfolio avec leur autorisation.

Ayant peu de connaissances préalables en PowerShell et Redis, j'ai particulièrement rencontré des difficultés dans la création d'une "queue" pour le cache Redis. Après des recherches approfondies, j'ai découvert que le modèle de hook auquel j'étais habitué avec React n'était pas nécessaire. En effet, Redis propose une fonction de pop bloquante que l'on peut appeler récursivement pour attendre une mise à jour avant de traiter un événement, plutôt que d'attacher un abonnement et d'attendre un message.

Une fois cette difficulté surmontée, le reste du projet s'est déroulé rapidement, jusqu'à la phase de test. Ayant effectué la majeure partie de mes tests sur les services CI/CD (GitHub Actions et Bitbucket Pipeline), j'avais peu d'expérience en matière de tests unitaires embarqués. J'ai donc cherché comment ouvrir plusieurs clients socket et vérifier cela directement via PowerShell. J'ai finalement trouvé le package `socket.io-client`, qui permet de créer un client Socket.io sans ouvrir une page web. J'ai créé un fichier JS exécutable via Node, qui instanciera de manière asynchrone les sockets nécessaires et effectuera les appels socket de manière automatisée.

Une fois le projet terminé, l'erreur étant humaine de nature, j'ai soumis l'intégralité du code à ChatGPT pour une relecture. Il a commenté mon projet, corrigé l'indentation et les fautes d'orthographe. Je lui ai également demandé de générer un README pour chaque exercice. Après de multiples relectures de ma part, j'ai finalement atteint une version qui me satisfait.

Cet exercice a été un véritable plaisir, et j'ai donné le meilleur de moi-même car décrocher ce poste est une priorité pour moi.

Merci et à très vite !