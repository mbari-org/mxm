2023-04

- use my enhanced QDarkMode component
- minor type related fixes

2022-12

- upgrade quasar (2.10.2) and a few other dependencies
- bump version and minor style adjustment

2022-11

- mission statuses: show date and elapsed time
- minor linting

2022-10

- reflect missionStatusUpdates
- preps for new mission.missionStatusUpdates
- adjustments in mission page actions
- "Create mission draft" label for mission creation
- subscribe to and reflect mission updates in MissionsPage.
  The subscription here could be for the particular provider but no big deal.
- subscribe to and reflect mission updates
- open provider page right after registration
- provider registration now with subscription to reflect progress.
  - todo: if percentComplete given, use something like q-linear-progress
- fix in refresh of provider page upon adding a new mission.
- some style adjustments
- fixed display of google base layer upon re-opening a QMap
- `MissionsPage`: no need for `assetClasses` in query.
  - also no need for `missionTemplates` but just `numActualMissionTemplates`
    to enable the `MissionNewButton`, which now makes the query for the templates.
- refresh only the mission itself if already submitted
- refresh mission template for mission dispatch if corresponding retrievedAt is missing
- some adjustments
- improved error handling with support from mxm-server
  - added utl.exceptionHelper to help with exception handling especially to be
    used in requests to backend involving interaction with external provider.

- reflect MXM model changes:
  - unit is now a separate entity
  - asset classes and assets are now separate entities
  - routes adjusted accordingly

2022-09

- basic dispatch of validateMission
- ProviderApiType enum value was renamed to `REST`
- some boot file typing
- re-enabled google base layers
  - as in other apps using googlemutant=0.8.0 due to new 0.13 not working right away
- dispatch DMapDialog in MissionTemplate page
- set version 0.9.2 toward release
- initial commit with an overall migration of and improvement over previous version.
