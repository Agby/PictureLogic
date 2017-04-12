class PictureLogic extends React.Component {
   constructor(props) {
    super(props)
    const map = {
      columnNum: 10,
      rowNum: 10,
      logics: {
        column: [[4], [1, 1, 1], [2, 1], [7, 1], [3, 4], [8], [3, 1, 1, 2], [2, 1, 2], [5, 1], [3, 2]],
        row: [[1, 1], [2, 2], [8], [1, 3, 2], [2, 4, 2], [1, 1, 1, 2], [9], [2], [4, 1], [7]],
      }
    }
    this.state = {
      map,
      resultArray: this.initResult(map),
      showInitButton: false,
    }
  }

  initResult(map ,arr = [], type = null) {
    const resultArray = []
    map.logics.column.forEach((column, indexX) => {
      resultArray.push([])
      map.logics.row.forEach((row,indexY) => {
        if (arr[indexX] && arr[indexX][indexY] && arr[indexX][indexY].status === 'finish' && type != null) {
          resultArray[indexX].push(arr[indexX][indexY])
        } else if (type === 'row') {
          const cell = arr[indexX][indexY]
          resultArray[indexX].push({valueColumn: cell.valueColumn, valueRow: 0, status: cell.status})
        } else if (type === 'column') {
          const cell = arr[indexX][indexY]
          resultArray[indexX].push({valueColumn: 0, valueRow: cell.valueRow, status: cell.status})
        }
        else
          resultArray[indexX].push({valueColumn: 0, valueRow: 0, status: 'none'})

      })
    })
    return resultArray
  }

  calculateLine(line, total, maxCount, joinIndex, result, lineIndex, type) {
    let newResult = result
    const currentTotal = line.reduce((acc, val) => (
      acc + val
    ))
    if (total - currentTotal === 0 && line.length === maxCount) {
      if (this.isLegitimate(line, maxCount, lineIndex, type)) {
        newResult.push(line)
      }

    }
    for (let i = total - currentTotal; i > -1; i--) {
      let newLine = line.slice()
      newLine.splice(joinIndex, 0, i)
      if (newLine.length <= maxCount)
        newResult = this.calculateLine(newLine, total, maxCount, joinIndex + 2, newResult, lineIndex, type)
    }
    return newResult
  }

  calculateResult() {
    const { map, resultArray} = this.state
    let NewResultArray = this.initResult(map, resultArray,'column')
    map.logics.column.forEach((item, index) => {
      const maxCount = item.length + item.length + 1
      const probabilities = this.calculateLine(item, map.columnNum, maxCount, 0, [], index, 'column')
      NewResultArray = this.updateMap(NewResultArray, probabilities, index, 'column')
    })

    NewResultArray = this.initResult(map, NewResultArray, 'row')
    map.logics.row.forEach((item, index) => {
      const maxCount = item.length + item.length + 1
      const probabilities = this.calculateLine(item, map.rowNum, maxCount, 0, [], index, 'row')
      NewResultArray = this.updateMap(NewResultArray, probabilities, index, 'row')
    })
    this.setState({resultArray: NewResultArray})
  }

  isLegitimate (line, maxCount, lineIndex, type) {
    const needNumber = maxCount - 2
    const {resultArray, map} = this.state
    let checkNumber = 0
    let result = true
    let count = 0
    line.forEach((number, index) => {
      // number count check / first and last number can be zero
      if (number > 0 && index !== 0 && index !== line.length - 1)
        checkNumber += 1
      for (let i = count; i < count + number; i++) {
        const cell = type === 'column' ? resultArray[lineIndex][i] : resultArray[i][lineIndex]
        const plusMinusSign = index % 2 > 0 ? 1 : -1
        if (cell.status === 'finish') {
          if (type === 'column' && (cell.valueRow > 0 !== plusMinusSign > 0)){
            result = false
            break
          }
          if (type === 'row' && (cell.valueColumn > 0 !== plusMinusSign > 0)){
            result = false
            break
          }
        }
      }
      count = count + number
    })
    if (checkNumber < needNumber) {
      result = false
    }
    return result
  }

  updateMap(map, probabilities, lineIndex, type) {
    const isAns = probabilities.length === 1
    probabilities.forEach(probability => {
      let count = 0
      probability.forEach((item, index) => {
        for (let i = count; i < count + item; i++) {
          const target = type === 'column' ? map[lineIndex][i] : map[i][lineIndex]
          const plusMinusSign = index % 2 > 0 ? 1 : -1
          if (target.status !== 'finish') {
            if (type === 'column') {
              target.valueColumn  = isAns ? plusMinusSign : (target.valueColumn + plusMinusSign)
              target.status = isAns ? 'finish' : 'none'
              if (Math.abs(target.valueColumn) === probabilities.length) {
                target.status = 'finish'
                target.valueRow = plusMinusSign
                target.valueColumn = plusMinusSign
              }
            } else {
              target.valueRow = isAns ? plusMinusSign : (target.valueRow + plusMinusSign)
              target.status = isAns ? 'finish' : 'none'
              if (Math.abs(target.valueRow) === probabilities.length) {
                target.status = 'finish'
                target.valueRow = plusMinusSign
                target.valueColumn = plusMinusSign
              }
            }
          }
        }
        count = count + item
      })
    })
    return map
  }
  mapColumnRender() {
   return this.state.map.logics.column.map((column, index) => {
     return (
       <input
        className='input-item'
        key={`map-column-${index}`}
        value={column}
        onChange={this.handlerLogicChange.bind(this, 'column', index)}
      />
     )
   })
  }
  mapRowRender() {
    return this.state.map.logics.row.map((row, index) => {
      return (
        <input className='input-item'
          key={`map-row-${index}`}
          value={row}
          onChange={this.handlerLogicChange.bind(this, 'row', index)}
        />
      )
    })
  }
  resultArrayRender() {
    return this.state.resultArray.map((column, indexX) => {
      return (
        <div className='column' key={`column-${indexX}`}>
          {column.map((row, indexY) => {
            const displayClassName = row.valueColumn > 0 ? 'finish fill' : 'finish null'
            const displayClass = row.status === 'finish'? displayClassName : ''
            return (
              <div className={`cell ${displayClass}`} key={`row-${indexY}`}>
                {row.status === 'finish' ? '' : ''}
              </div>
            )
          })}
        </div>
      )
    })
  }
  handleClick() {
    this.calculateResult()
  }
  handlerRangeChange(type, e) {
    const { map } = this.state
    if (type === 'columnNumChange') {
      map.columnNum = e.target.value
    } else if (type === 'rowNumChange') {
      map.rowNum = e.target.value
    }
    this.setState({ map , showInitButton: true})
  }
  handlerLogicChange(type, index, e) {
    const { map } = this.state
    if (type === 'column') {
      map.logics.column[index] = e.target.value.split(',')
      map.logics.column[index] = map.logics.column[index].map(item => {
        if (!isNaN(parseInt(item)))
          return parseInt(item)
        return item
      })
    } else {
      map.logics.row[index] = e.target.value.split(',')
      map.logics.row[index] = map.logics.row[index].map(item => {
        if (!isNaN(parseInt(item)))
          return parseInt(item)
        return item
      })
    }
    this.setState({ map, showInitButton: true })
  }
  initArray() {
    const { map } = this.state
    const countColumn = Math.abs(map.logics.column.length - map.columnNum)
    for (let i = 0; i < countColumn; i++) {
      if (map.logics.column.length < map.columnNum) {
        map.logics.column.push([map.rowNum])
      }
      else {
        map.logics.column.pop()
      }
    }
    const countRow = Math.abs(map.logics.row.length - map.rowNum)
    for (let i = 0; i < countRow; i++) {
      if (map.logics.row.length < map.rowNum) {
        map.logics.row.push([map.columnNum])
      }
      else {
        map.logics.row.pop()
      }
    }
    const resultArray = this.initResult(map)
    this.setState({ map, resultArray, showInitButton: false})
  }
  render() {
    const { map, showInitButton } = this.state
    const initButton = showInitButton ? <div className='init-button' onClick={this.initArray.bind(this)}>init</div> : null
    return (
      <div className='main'>
        <div className="setTool">
          <div className='set-title'>Columns:
            <input className='set-input'
              value={map.columnNum}
              onChange={this.handlerRangeChange.bind(this, 'columnNumChange')}
            />
          </div>
          <div className='set-title'>Rows:
            <input className='set-input'
              value={map.rowNum}
              onChange={this.handlerRangeChange.bind(this, 'rowNumChange')}
            />
          </div>
          {initButton}
          <div
            className='start'
            onClick={this.handleClick.bind(this)}
          >
          Click me!
          </div>
        </div>
        <div className='map-columns'>{this.mapColumnRender()}</div>
        <div className='map-rows'>{this.mapRowRender()}</div>
        <div className='map-array'>
          <div className='resultArray'>
            {this.resultArrayRender()}
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<PictureLogic/>, document.getElementById('app'));
