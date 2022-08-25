package org.mbari.mxm.graphql;

import io.quarkus.arc.Unremovable;
import io.quarkus.runtime.annotations.RegisterForReflection;
import org.eclipse.microprofile.graphql.Source;
import org.mbari.mxm.db.unit.Unit;
import org.mbari.mxm.db.unit.UnitService;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.util.List;

@ApplicationScoped
@RegisterForReflection
@Unremovable
public class ForUnit {
  @Inject
  UnitService unitService;

  public List<List<Unit>> derivedUnits(@Source List<Unit> units) {
    return unitService.getDerivedUnitsMultiple(units);
  }
}
