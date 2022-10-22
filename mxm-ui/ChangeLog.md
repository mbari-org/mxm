2022-10

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
