package org.mbari.mxm.db.asset;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.quarkus.runtime.annotations.RegisterForReflection;
import javax.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@RegisterForReflection
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Asset {

  @NotNull public String providerId;
  @NotNull public String assetId;

  public Asset(String providerId, String assetId) {
    this.providerId = providerId;
    this.assetId = assetId;
  }

  public String className;
  public String description;
}
