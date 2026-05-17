import { ApiBigIntId } from '../api-property.helpers';
import { CatalogStamped } from './catalog-stamped.schema';

export class CatalogNodeSocketRule extends CatalogStamped {
  @ApiBigIntId()
  catalogNodeVersionId: string;

  @ApiBigIntId()
  catalogNodeSocketFromId: string;

  @ApiBigIntId()
  catalogNodeSocketToId: string;
}
