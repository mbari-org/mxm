# Mission Execution Mediation Service

**WIP**

The Mission Execution Mediation Service (MXM) effort seeks to provide a set of
programmatic and user interfaces to integrate mission information across
diverse mission execution systems at MBARI, as well as to support the integration
of third-party applications, in particular to facilitate extended planning
capabilities on MBARI assets

The proposed MXM interfaces will support a unified view of the information in terms
of available mission definitions, parameterization, scheduling, and execution status.

## The MXM ecosystem

The MXM ecosystem consists of the following components:

- MXM Server: the central MXM service where mission execution systems (_providers_)
  can be registered to expose all relevant mission information and capabilities for
  mission scheduling.
- MXM Webapp: The GUI for the MXM service.
- Providers: The external mission execution systems integrated into the MXM ecosystem.
  Each provider implements an MXM Provider API (in full or in part, depending on capabilities)
  to support this integration.

## MXM Webapp

This is the web based GUI for the MXM service.
The current focus of this GUI is on facilitating the development of the overall system,
so the exposed UI organization and functionality may not be very user-friendly yet.

NOTE:
This repo was created from an initial prototype that used a preliminary MXM GraphQL API,
and with Vue2/Quasar1 as web framework.
The new version here is built with Vue3/Quasar2 and newer Apollo mechanisms,
and uses a new, simplified API being developed in a separate repo.

## Development

### Dependencies

    yarn global add @quasar/cli
    yarn

### Development modes

`quasar dev` as usual, but this can be launched in two ways:

#### Direct `quasar dev`

With an MXM server already running somewhere, set `MXM_SERVER_URL` with the server URL
in `mxmConfig.ts`, and run:

    quasar dev

which should open <http://localhost:9000/> in your browser.
Note that 9000 is the default devServer port for the webapp.

#### Launched by the MXM server, `quarkus dev`

A general development setup is to have the `mxm-ui` and `mxm-server` clones as siblings on the host.
Then, under the `mxm-server` clone, one can just start the server in development mode:

    quarkus dev

and this will take care of also launching and proxying the UI.
In this case, type `w` in the `quarkus dev` REPL, which should
open <http://localhost:8080/> in your browser.
Note that 8080 is the configured port for the server.

### Build

As usual with Quasar, the build is done with `quasar build`.
However, per our general setup, the server side takes care of this as well.
