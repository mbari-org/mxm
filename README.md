> [!note]
> The `mxm-server`, `mxm-ui`, and `mxm-doc` modules were recently made direct subdirectories
> to this repo. (Previously, they were submodules pointing to separate repos.)
>
> Some notes below and in other READMEs might be out-of-date.

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

## This repo

This is a parent repo that aggregates the various MXM components,
builds and releases the integrated dockerized image,
provides general information and pointers,
and facilitates issue tracking at a general level.
This overall organizational scheme is subject to change as the project progresses.

See also [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

### Some Links

- [MXM Spec Doc](https://docs.google.com/document/d/1Fx8C92x4uB9dCx9SH7cpCscn8LqSZywyYm47y8TKDJY)
- [Initial prototype implementation](https://docs.google.com/document/d/1aaYhCVzL0YrlpRZhPJZWhIbcjFDoz1AkzsIIs4NgIY8/)
- [MXM Docs](https://docs.mbari.org/internal/mxm/)
