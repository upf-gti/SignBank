   #!/bin/sh
   set -e

   # Run migrations
   npx prisma migrate dev

   # Start the app
   exec "$@"