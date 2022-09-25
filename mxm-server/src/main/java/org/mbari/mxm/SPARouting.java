package org.mbari.mxm;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.vertx.ext.web.Router;
import java.util.Objects;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.inject.ConfigProperty;

// With the mxm-ui component in history mode, part of the following below to
// redirect to / for GET requested paths starting with `/p/` or equal to `/p`.

// https://quarkiverse.github.io/quarkiverse-docs/quarkus-quinoa/dev/#spa-routing
// "Currently, for technical reasons, the Quinoa SPA routing configuration won’t work
// with RESTEasy Classic. Instead, you may use a workaround (if your app has all the
// rest resources under the same path prefix)"

@ApplicationScoped
@Slf4j
public class SPARouting {

  private static final boolean historyMode = false;

  private static final String MXM_EXTERNAL_URL = System.getenv("MXM_EXTERNAL_URL");

  /**
   * Path used by the UI to retrieve the configuration.
   */
  public static final String CONFIG_JSON_PATH = "/mxmConfig.json";

  @ConfigProperty(name = "mxm.version")
  String mxmVersion;

  public void init(@Observes Router router) {
    router
        .get("/*")
        .handler(
            rc -> {
              final var path = rc.normalizedPath();

              log.debug("SPARouting: path='{}'", path);

              if (historyMode) {
                // part of some preliminary tests
                if (path.matches("^/p(/.*)?$")) {
                  log.debug("SPARouting: rerouting to / for path='{}'", path);
                  rc.reroute("/");
                  return;
                }
              }

              // provide server related config to the UI:
              if (path.equals(CONFIG_JSON_PATH)) {
                final String serverLoc =
                    Objects.requireNonNullElseGet(
                        MXM_EXTERNAL_URL,
                        () -> rc.request().scheme() + "://" + rc.request().host());

                MxmConfig config = new MxmConfig(mxmVersion, serverLoc);
                final var uiConfig = Utl.writeJson(config);
                rc.response().putHeader("content-type", "application/json").end(uiConfig);
              } else {
                log.debug("SPARouting: calling next() for path='{}' ", path);
                rc.next();
              }
            });
  }

  @JsonInclude(JsonInclude.Include.NON_NULL)
  static class MxmConfig {
    public final String mxmVersion;
    public final String graphqlUri;
    public final String websocketUrl;
    public final String graphqlSchema;
    public final String graphqlUi;
    public final String openapi;
    public final String openapiSchema;
    public final String swaggerUi;
    public final String repoUrl;
    public final String learnMoreUrl;
    public final String googleApiKey;

    public MxmConfig(String mxmVersion, String serverLoc) {
      this.mxmVersion = mxmVersion;
      this.graphqlUri = serverLoc + "/graphql";
      this.websocketUrl = this.graphqlUri.replaceFirst("^http", "ws");
      this.graphqlSchema = serverLoc + "/graphql/schema.graphql";
      this.graphqlUi = serverLoc + "/q/graphql-ui";
      this.openapi = serverLoc + "/q/openapi";
      this.openapiSchema = serverLoc + "/q/openapi";
      this.swaggerUi = serverLoc + "/q/swagger-ui";
      this.googleApiKey = System.getenv("GOOGLE_API_KEY");
      this.repoUrl = "https://github.com/mbari-org/mxm";
      this.learnMoreUrl = "https://docs.mbari.org/internal/mxm/";

      log.debug("SPARouting: graphqlUri='{}'", this.graphqlUri);
    }
  }
}
