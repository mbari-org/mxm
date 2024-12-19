# Some development notes

#### new general setup wrt previous version

- Now using Vue3, Quasar2, Pinia, Typescript.
- Better organized and simplified configuration handling.
- Several apollo and query adjustments.
- New core component `QDrawer` that handles geojson editing. Uses of leaflet-geoman.
- `QMap` and associated components, with direct use of leaflet.
  - Ability to have multiple `QMap`, with subcomponents discovering their
    containing `QMap` via a `data-lmapid` attribute.
- Some exploration with codegen+typescript-vue-apollo-smart-ops but seems like no support for vue3,
  some tests didn't work; also quickly explored graphql-typed-document-node; in any case, far from
  straightforward.
- Some graphql subscriptions - functional but preliminary.
- Dark mode in this new version.

#### history mode

TODO revisit this under the quarkus/quinoa dispatch from the server.

The following notes mainly related with Quasar1 (`quasar dev`, `quasar serve --history ..`).

With history mode (`vueRouterMode: 'history'`), all seems to work _except_ that individual
mission template files are not found.
Example <http://localhost:8080/TD_18080/mt/%2F_examples%2FSysLogExample.tl>.
Adding a trailing slash makes it work:
<http://localhost:8080/TD_18080/mt/%2F_examples%2FSysLogExample.tl/>.
So, I suspect this is due to the following:
- the `.tl` "file extension" (actually, also any other file extension that may get associated
  with a some non-html content-type) makes the browser set an Accept header that does not
  include html (or that includes it but with less preference).
- then, both `quasar dev` and `quasar serve --history ...` respond with not-found
  due to such Accept header.
So, this seems like a quasar bug because their `--history` option description says
"Use history api fallback; **All** requests fallback to /index.html".
I'm not finding any concrete known issues, but this seems somwhat related:
<https://github.com/quasarframework/quasar/issues/8513>.

---
> BTW, with default options, curlie differs wrt to httpie or curl, for example:
> ```
> curlie get http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/
> ```
> responds with not-found, but both of these work:
> ```
> http        http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/
> curl -X GET http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/
> ```
> As indicated with the `--curl` option:
> ```
> $ curlie --curl get http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/
> curl -X GET http://localhost:4000/TD_18080/mt/%2F_examples%2FSysLogExample.tl/ -s -S -v -H "Accept: application/json, */*"
> ```
> the issue is that 'application/json' is given preference in Accept header.
