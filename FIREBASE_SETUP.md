# Configuração Firebase do NEXUS Forense

A aplicação usa o Firebase Authentication para login por e-mail e senha e o Cloud Firestore para sincronizar os registros estruturados do workspace por usuário. O Local Storage continua sendo o cache imediato e o modo offline; alterações feitas sem conexão são mantidas no dispositivo e enviadas quando a conta voltar a ficar conectada.

No Firebase Console, ative **Authentication → Sign-in method → Email/Password** e crie um banco **Cloud Firestore**. Publique as regras presentes em `firestore.rules`. As regras isolam cada conta pelo `request.auth.uid`.

A configuração web informada pelo proprietário está em `client/src/lib/firebase.ts`. Esses valores são identificadores públicos do aplicativo web; a proteção depende das regras Firebase e não de esconder o `apiKey`.

Os metadados dos anexos são sincronizados com os registros estruturados, mas os bytes de fotos e vídeos continuam no IndexedDB local nesta etapa. Isso evita fazer upload de material sensível sem uma decisão específica sobre retenção, criptografia e política de acesso. A próxima etapa pode habilitar o Firebase Storage para arquivos, usando as regras de `storage.rules`.

Para publicar as regras com a CLI do Firebase, associe o projeto `nexus-forense` e execute `firebase deploy --only firestore:rules,storage`.
