plan :

1 : who am i ? le front (rendu sur le port ) demande a l'express qui il est via socket (user + pass)
2 : who he ? l'express demande a la db qui est l'utilisateur via mongo (user + pass)
3 : he a champion ! mongo repond son uid en callback a l'express
4 : i am a champion ! l'express lie l'uid a la socket et prévient le front via socket
5 : champion says what ? le front demande a l'express via socket de poser un bet
6 : what ? l'express pub a redis le bet
6.1 : what ? l'express preleve le bet sur le compte de l'utilisateur (son compte peut etre en negatif, credits aurorisés)
7 : ding dong ! le workerHolder qui est sub a redis est prevenu qu'un bet a été posé
8 : process bet ! le workerHolder, prévenu par le sub, regarde si un worker est libre, si oui, lui envoie le bet, sinon return
(de leurs coté, les worker vont traiter les bet qu'on leur donne, une fois fini, regarder si il y a un autre bet a traiter, si oui, le traiter, si non, se mettre en libre)
9 : bet processed ! le worker une fois le process effectué (un wait de 300 a 500 ms) previent l'express via call api sur le port /api/bet/processed
9.1 : bet placed ! l'express, ajoute le bet a la betDB via mongo
10 : bet placed ! l'express previent le front via socket que le bet a été placé
11 : les jeux sont fait ! une lambda simulant la game est trigger par chronos, elle va chercher les bets dans la betDB, les traite
12 : gg wp ! la lambda donne de l'argent aux gagnants
13 : x won ! lambda previent l'express via call api sur le port /api/bet/won
14 : u won ! l'express previent le front via socket que le bet a été gagné

ordre developpement :

1 : l'express qui serve le front (port 3000/)
2 : un front bateau
3 : les DB (mongo, redis)
4 : l'express qui sert l'api (port 3001/api/)
5 : un workerHolder
6 : attacher le workerHolder a redis
7 : les workers
8 : la lambda game
9 : la utiliser la userdb
10 : poncer le front