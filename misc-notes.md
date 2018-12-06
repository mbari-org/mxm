### nested / batch mutations

- "Importing" a new "REST0" executor is currently done with separate mutation
queries for the various associated entities. This of course is still a
preliminary implementation but the approach in general is far from ideal
in terms of efficiency, lack of transaction nature, and convenience.
It would be better to handle this kind of cases in a single nested or batch
mutation. Since this is rather poorly supported in Postgraphile (see
https://github.com/graphile/postgraphile/issues/361, where the referenced plugin
is still in alpha status: https://github.com/mlipscombe/postgraphile-plugin-nested-mutations),
consider using an alternative tool like Prisma, which does provide such support:
https://www.prisma.io/docs/prisma-graphql-api/reference/mutations-qwe2/


- Been exploring Prisma a bit, but not really excited so far as it's proving to be
rather confusing, not so much about how to set the various pieces up (prisma client,
graphql-yoga.. at least at a basic level) but in particular about the role of prisma
client api vs. graphql api and in general how to avoid/minimize 'resolver' boilerplate:
ideally one would only write the datamodel and perhaps write/adjust the graphql schema.
Part of the confusion discussed here:
  https://www.prisma.io/forum/t/help-understanding-prisma-clients-value-proposition/4394
Seems like https://github.com/prisma/graphqlgen (intended to reduce "the need to write
boilerplate") should help here (but see https://github.com/prisma/graphqlgen/issues/332).
Also, it seems that confusion has accompanied the Prisma development in general:
  https://www.prisma.io/forum/t/graphcool-framework-and-prisma/2237
