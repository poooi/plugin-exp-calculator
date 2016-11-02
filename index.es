import　React, { Component } from 'react'
import { join } from 'path-extra'
import { connect } from 'react-redux'
import { sortBy, isEqual } from 'lodash'
import FontAwesome from 'react-fontawesome'

import { FormControl, FormGroup, ControlLabel, Grid, Col, Input, Table, InputGroup, Button } from 'react-bootstrap'

const { i18n, ROOT, getStore } = window
const __ = i18n["poi-plugin-exp-calc"].__.bind(i18n["poi-plugin-exp-calc"])

let successFlag = false

let exp = [
  0,       100,     300,     600,     1000,    1500,    2100,    2800,    3600,    4500,
  5500,    6600,    7800,    9100,    10500,   12000,   13600,   15300,   17100,   19000,
  21000,   23100,   25300,   27600,   30000,   32500,   35100,   37800,   40600,   43500,
  46500,   49600,   52800,   56100,   59500,   63000,   66600,   70300,   74100,   78000,
  82000,   86100,   90300,   94600,   99000,   103500,  108100,  112800,  117600,  122500,
  127500,  132700,  138100,  143700,  149500,  155500,  161700,  168100,  174700,  181500,
  188500,  195800,  203400,  211300,  219500,  228000,  236800,  245900,  255300,  265000,
  275000,  285400,  296200,  307400,  319000,  331000,  343400,  356200,  369400,  383000,
  397000,  411500,  426500,  442000,  458000,  474500,  491500,  509000,  527000,  545500,
  564500,  584500,  606500,  631500,  661500,  701500,  761500,  851500,  1000000, 1000000,
  1010000, 1011000, 1013000, 1016000, 1020000, 1025000, 1031000, 1038000, 1046000, 1055000,
  1065000, 1077000, 1091000, 1107000, 1125000, 1145000, 1168000, 1194000, 1223000, 1255000,
  1290000, 1329000, 1372000, 1419000, 1470000, 1525000, 1584000, 1647000, 1714000, 1785000,
  1860000, 1940000, 2025000, 2115000, 2210000, 2310000, 2415000, 2525000, 2640000, 2760000,
  2887000, 3021000, 3162000, 3310000, 3465000, 3628000, 3799000, 3978000, 4165000, 4360000,
  4564000, 4777000, 4999000, 5230000, 5470000
]

exp.unshift(exp[0])
exp.push(exp[exp.length - 1])

const expValue = [
  30, 50, 80, 100, 150, 50,
  120, 150, 200, 300, 250,
  310, 320, 330, 350, 400,
  310, 320, 330, 340, 200,
  360, 380, 400, 420, 450,
  380, 420, 100
]

const expPercent = [
  1.2, 1.0, 1.0, 0.8, 0.7
]

const expLevel = [
  "S", "A", "B", "C", "D"
]

const expMap = [
  "1-1 鎮守府正面海域", "1-2 南西諸島沖", "1-3 製油所地帯沿岸", "1-4 南西諸島防衛線", "1-5 [Extra] 鎮守府近海", "1-6 [Extra Operation] 鎮守府近海航路",
  "2-1 カムラン半島", "2-2 バシー島沖", "2-3 東部オリョール海", "2-4 沖ノ島海域", "2-5 [Extra] 沖ノ島沖",
  "3-1 モーレイ海", "3-2 キス島沖", "3-3 アルフォンシーノ方面", "3-4 北方海域全域", "3-5 [Extra] 北方AL海域",
  "4-1 ジャム島攻略作戦", "4-2 カレー洋制圧戦", "4-3 リランカ島空襲", "4-4 カスガダマ沖海戦", "4-5 [Extra] カレー洋リランカ島沖",
  "5-1 南方海域前面", "5-2 珊瑚諸島沖", "5-3 サブ島沖海域", "5-4 サーモン海域", "5-5 [Extra] サーモン海域北方",
  "6-1 中部海域哨戒線", "6-2 MS諸島沖", "6-3 グアノ環礁沖海域"
]

const expType = [
  __("Basic"),
  __("Flagship"),
  __("MVP"),
  __("MVP and flagship")
]

const bonusExpScaleFlagship = [
  [5, 8, 11, 15, 20],
  [10, 13, 16, 20, 25]
]

const bonusExpScaleNonFlagship = [
  [3, 5, 7, 10, 15],
  [4, 6, 8, 12, 17.5]
]

function getBonusType(lv) {
  return lv < 10 ? 0 : 10 <= lv && lv < 30 ? 1 : 30 <= lv && lv < 60 ? 2 : 60 <= lv && lv < 100 ? 3 : 4
}

export const reactClass = connect(
  state => ({
    horizontal: state.config.poi.layout || 'horizontal',
    $ships: state.const.$ships,
    ships: state.info.ships
  }),
  null, null, { pure: false }
)(class PoiPluginExpCalc extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lastShipId: 0,
      currentLevel: 1,
      nextExp: 100,
      goalLevel: 99,
      mapValue: 30,
      mapPercent: 1.2,
      totalExp: 1000000,
      lockInput: false,
      expSecond: [
        Math.ceil(1000000 / 30 / 1.2),
        Math.ceil(1000000 / 30 / 1.2 / 1.5),
        Math.ceil(1000000 / 30 / 1.2 / 2.0),
        Math.ceil(1000000 / 30 / 1.2 / 3.0)
      ],
      perExp: [
        30 * 1.2,
        30 * 1.2 * 1.5,
        30 * 1.2 * 2.0,
        30 * 1.2 * 3.0
      ],
      message: null,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.lockInput && this.state.lastShipId){
      const {$ships, ships} = nextProps
      let [currentLevel, nextExp, goalLevel] = this.getExpInfo(this.state.lastShipId, $ships, ships)
      const {_currentLevel, _nextExp, _goalLevel} = this.state
      if (!isEqual([currentLevel, nextExp, goalLevel], [_currentLevel, _nextExp, _goalLevel])){
        this.handleExpChange(currentLevel, nextExp, goalLevel, this.state.mapValue, this.state.mapPercent)
      }
    }
  }

  getRemodelLvsById(shipId) {
    const { $ships } = this.props
    let remodelLvs = [$ships[shipId].api_afterlv]
    let nextShipId = parseInt($ships[shipId].api_aftershipid)
    while (nextShipId != 0 && remodelLvs[remodelLvs.length - 1] < $ships[nextShipId].api_afterlv) {
      remodelLvs.push($ships[nextShipId].api_afterlv)
      nextShipId = parseInt($ships[nextShipId].api_aftershipid)
    }
    return remodelLvs
  }

  getExpInfo(shipId, $ships=this.props.$ships, ships = this.props.ships) {
    if (shipId <= 0) {
      return [1, 100, 99]
    }
    let goalLevel = 99
    if (ships[shipId].api_lv > 99) {
      goalLevel = 155
    } else if ($ships[ships[shipId].api_ship_id].api_afterlv != 0) {
      let remodelLvs = this.getRemodelLvsById(ships[shipId].api_ship_id)
      for (const lv of remodelLvs) {
        if (lv > ships[shipId].api_lv) {
          goalLevel = lv
          break
        }
      }
    }
    return [ships[shipId].api_lv, ships[shipId].api_exp[1], goalLevel]
  }

  handleShipChange = e => {
    if (e && e.target && e.target.value != NULL) {
      if (e.target.value != this.state.lastShipId) {
        this.setState({ lastShipId: e.target.value, message: null })
      }
      let [currentLevel, nextExp, goalLevel] = this.getExpInfo(e.target.value)
      this.handleExpChange(currentLevel, nextExp, goalLevel, this.state.mapValue, this.state.mapPercent)
    }
  }
  handleExpChange = (currentLevel, nextExp, goalLevel, mapValue, mapPercent) => {
    currentLevel = parseInt(currentLevel)
    nextExp = parseInt(nextExp)
    goalLevel = parseInt(goalLevel)
    mapValue = parseInt(mapValue)
    let totalExp = exp[goalLevel] - exp[currentLevel + 1] + nextExp
    let noneType = totalExp / mapValue / mapPercent
    let noneRank = mapValue * mapPercent
    this.setState({
      currentLevel: currentLevel,
      nextExp: nextExp,
      goalLevel: goalLevel,
      mapValue: mapValue,
      totalExp: totalExp,
      expSecond: [
        Math.ceil(noneType),
        Math.ceil(noneType / 1.5),
        Math.ceil(noneType / 2.0),
        Math.ceil(noneType / 3.0)
      ],
      perExp: [
        noneRank,
        noneRank * 1.5,
        noneRank * 2.0,
        noneRank * 3.0
      ],
      message: null
    })
  }
  handleResponse = e => {
    const { path, body } = e.detail
    const { ships } = this.props
    switch (path) {
    case '/kcsapi/api_req_member/get_practice_enemyinfo':
      let enemyShips = body.api_deck.api_ships
      let baseExp = exp[enemyShips[0].api_level] / 100 + exp[enemyShips[1].api_level != null ? enemyShips[1].api_level : 0] / 300
      baseExp = baseExp <= 500 ? baseExp : 500 + Math.floor(Math.sqrt(baseExp - 500))
      let bonusScale = ["0%", "0%", "0%", "0%"]
      let bonusFlag = false
      let message = null
      let fleets = getStore('info.fleets')
      let $ships = getStore('const.$ships')
      for (const index in fleets) {
        let fleetShips = fleets[index]
        let flagshipFlag = false
        let trainingLv = 0
        let trainingCount = 0
        for (const idx in fleetShips.api_ship) {
          let shipId = fleetShips.api_ship[idx]
          if (shipId == -1) {
            break
          }
          let ship = ships[shipId]
          if ($ships[ship.api_ship_id].api_stype == 21) {
            trainingCount += 1
            if (!flagshipFlag) {
              if (ship.api_lv > trainingLv) {
                trainingLv = ship.api_lv
              }
            }
            if (idx == 0) {
              flagshipFlag = true
            }
          }
        }
        if (trainingCount >= 2) {
          trainingCount = 2
        }
        if (trainingCount != 0) {
          bonusFlag = true
          let bonusType = getBonusType(trainingLv)
          if (flagshipFlag) {
            bonusScale[index] = bonusExpScaleFlagship[trainingCount - 1][bonusType]
          } else {
            bonusScale[index] = bonusExpScaleNonFlagship[trainingCount - 1][bonusType]
          }
          bonusScale[index] = `${ bonusScale[index] }%`
        }
        message = `${ __('Exp') }: [A/B] ${ Math.floor(baseExp) }, [S] ${ Math.floor(baseExp * 1.2) }`
        if (bonusFlag) {
          message = `${ message }, ${ __("+ %s for each fleet", bonusScale.join("/")) }`
        }
      }
      if (message != null) {
        successFlag = true
        this.setState({ message: message })
      }
    }
  }
  handleCurrentLevelChange = e => {
    this.handleExpChange(e.target.value, this.state.nextExp, this.state.goalLevel, this.state.mapValue, this.state.mapPercent)
  }
  handleNextExpChange = e => {
    this.handleExpChange(this.state.currentLevel, e.target.value, this.state.goalLevel, this.state.mapValue, this.state.mapPercent)
  }
  handleGoalLevelChange = e => {
    this.handleExpChange(this.state.currentLevel, this.state.nextExp, e.target.value, this.state.mapValue, this.state.mapPercent)
  }
  handleExpMapChange = e => {
    this.handleExpChange(this.state.currentLevel, this.state.nextExp, this.state.goalLevel, e.target.value, this.state.mapPercent)
  }
  handleExpLevelChange = e => {
    this.handleExpChange(this.state.currentLevel, this.state.nextExp, this.state.goalLevel, this.state.mapValue, e.target.value)
  }

  handleShipChange = e => {
    if (e && e.target.value != this.state.lastShipId) {
      this.state.lastShipId = e.target.value
    }
    let [_currentLevel, _nextExp, _goalLevel] = this.getExpInfo(this.state.lastShipId)
    this.handleExpChange(_currentLevel, _nextExp, _goalLevel, this.state.mapValue, this.state.mapPercent)
  }

  handleLock = e => {
    if(this.state.lockInput) { // need to unlock and update state
      this.setState({lockInput: !this.state.lockInput})
      let [_currentLevel, _nextExp, _goalLevel] = this.getExpInfo(this.state.lastShipId)
      this.handleExpChange(_currentLevel, _nextExp, _goalLevel, this.state.mapValue, this.state.mapPercent)
    }
    else {
      this.setState({lockInput: !this.state.lockInput})
    }
  }

  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse)
  }
  componentWillUnmount = () => {
    window.removeEventListener('game.response', this.handleResponse)
  }
  componentDidUpdate = () => {
    if (successFlag) {
      successFlag = false
      window.success(this.state.message, {
        priority: 2,
        stickyFor: 1000
      })
    }
  }
  render() {
    let row = this.props.horizontal == 'horizontal' ? 6 : 3
    let shipRow = this.props.horizontal == 'horizontal' ? 12 : 5
    let mapRow = this.props.horizontal == 'horizontal' ? 9 : 5
    let rankRow = this.props.horizontal == 'horizontal' ? 3 : 2
    let nullShip = { api_id: 0, text: __("NULL") }
    const { $ships } = this.props
    let ships = Object.keys(this.props.ships).map(key => this.props.ships[key])
    ships = sortBy(ships, e => -e.api_lv)
    return (
      <div id="ExpCalcView" className="ExpCalcView">
        <link rel="stylesheet" href={join(__dirname, 'assets', 'exp-calc.css')} />
        <Grid>
          <Col xs={shipRow}>
            <FormGroup>
              <ControlLabel>{__("Ship")}</ControlLabel>
              <FormControl
                componentClass="select"
                value={this.state.lastShipId}
                onChange={this.handleShipChange}
              >
                <option value={nullShip.api_id}>{nullShip.text}</option>
                { ships &&
                  ships.map(ship => React.cloneElement(
                    <option value={ship.api_id}>
                      Lv. {ship.api_lv} - {__($ships[ship.api_ship_id].api_name)}
                    </option>))}
              </FormControl>
            </FormGroup>
          </Col>
          <Col xs={mapRow}>
            <FormGroup>
              <ControlLabel>{__("Map")}</ControlLabel>
              <FormControl
                componentClass="select"
                onChange={this.handleExpMapChange}
              >
                { Array.from({length: expMap.length}, (v, k) => k).map(idx => React.cloneElement(
                  <option value={expValue[idx]}>{expMap[idx]}</option>
                ))}
              </FormControl>
            </FormGroup>
          </Col>
          <Col xs={rankRow}>
            <FormGroup>
              <ControlLabel>{__("Result")}</ControlLabel>
              <FormControl
                componentClass="select"
                onChange={this.handleExpLevelChange}
              >
                { Array.from({length: expLevel.length}, (v, k) => k).map(idx => React.cloneElement(
                  <option value={expPercent[idx]}>{expLevel[idx]}</option>
                ))}
              </FormControl>
            </FormGroup>
          </Col>
          <Col xs={row}>
            <FormGroup>
              <ControlLabel>{__("Actual level")}</ControlLabel>
              <FormControl
                type="number"
                value={this.state.currentLevel}
                onChange={this.handleCurrentLevelChange}
              />
            </FormGroup>
          </Col>
          <Col xs={row}>
            <FormGroup>
              <ControlLabel>{__("To next")}</ControlLabel>
              <FormControl
                type="number"
                value={this.state.nextExp}
                onChange={this.handleNextExpChange}
              />
            </FormGroup>
          </Col>
          <Col xs={row}>
            <FormGroup>
              <ControlLabel>{__("Goal")}</ControlLabel>
              <FormControl
                type="number"
                value={this.state.goalLevel}
                onChange={this.handleGoalLevelChange}
              />
            </FormGroup>
          </Col>
          <Col xs={row}>
            <FormGroup>
              <ControlLabel>{__("Total exp")}</ControlLabel>
              <InputGroup>
                <FormControl
                  type="number"
                  value={this.state.totalExp}
                  readOnly
                />
                <InputGroup.Button>
                  <Button bsStyle={this.state.lockInput ? "warning" : "link"} onClick={this.handleLock}>
                    <FontAwesome name={this.state.lockInput ? "lock" : "unlock"} />
                  </Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </Col>
        </Grid>
        <Table>
          <tbody>
            <tr key={0}>
              <td>　</td>
              <td>{__("Per attack")}</td>
              <td>{__("Remainder")}</td>
            </tr>
            { Array.from({length: expType.length}, (v, k) => k).map(idx => React.cloneElement(
              <tr>
                <td>{expType[idx]}</td>
                <td>{this.state.perExp[idx]}</td>
                <td>{this.state.expSecond[idx]}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    )
  }
})
