import { ApiBigIntId, ApiJsonValueOptional } from '../api-property.helpers';
import { Audited } from './audited.schema';

export class BoardNodeProp extends Audited {
  @ApiBigIntId()
  boardId: string;

  @ApiBigIntId()
  nodeId: string;

  @ApiBigIntId()
  catalogNodePropertyId: string;

  @ApiJsonValueOptional()
  value: unknown;
}
