import { Button, Classes, Intent, Popover, Position } from '@blueprintjs/core'
import FA from 'react-fontawesome'

interface LevelDropdownProps {
  levels: number[]
  onSelect: (level: number) => void
}

const LevelDropdown = ({ levels, onSelect }: LevelDropdownProps) => (
  <Popover
    minimal
    position={Position.BOTTOM}
    content={
      <div>
        {levels.map((level) => (
          <Button
            minimal
            key={level}
            onClick={() => onSelect(level)}
            className={Classes.POPOVER_DISMISS}
          >
            {level}
          </Button>
        ))}
      </div>
    }
  >
    <Button minimal intent={Intent.PRIMARY}>
      <FA name="star" />
    </Button>
  </Popover>
)

export default LevelDropdown
