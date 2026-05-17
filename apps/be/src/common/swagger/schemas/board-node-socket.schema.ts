import { ApiBigIntId } from '../api-property.helpers';
import { Audited } from './audited.schema';

export class BoardNodeSocket extends Audited {
  @ApiBigIntId()
  boardId: string;

  @ApiBigIntId()
  nodeId: string;

  @ApiBigIntId()
  catalogNodeSocketId: string;
}
