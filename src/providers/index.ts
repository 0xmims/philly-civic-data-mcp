import type { DatasetDefinition, Provider } from "../types.js";
import { CivicDataError } from "../utils/errors.js";
import { ArcGISProvider } from "./arcgis.js";
import { CartoProvider } from "./carto.js";
import { StaticFileProvider } from "./staticFile.js";

const providers = {
  arcgis: new ArcGISProvider(),
  carto: new CartoProvider(),
  static: new StaticFileProvider()
} satisfies Record<string, Provider>;

export function providerFor(dataset: DatasetDefinition): Provider {
  const provider = providers[dataset.provider.kind];

  if (!provider) {
    throw new CivicDataError(
      `Unsupported provider "${dataset.provider.kind}" for ${dataset.id}.`,
      "unsupported_provider"
    );
  }

  return provider;
}

export { ArcGISProvider } from "./arcgis.js";
export { CartoProvider, filtersToSql } from "./carto.js";
export { StaticFileProvider } from "./staticFile.js";
