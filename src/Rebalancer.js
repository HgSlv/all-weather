import React, { Component } from "react"
import "./App.css"
import ContentEditable from "react-contenteditable"
import { defaultInstruments } from "./utils/constants"

class Rebalancer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      capital: 0,
      instrumentsUpdated: true, // set to false to fetch live data
      instruments: defaultInstruments,
    }
  }

  async componentDidMount() {
    if (this.state.instrumentsUpdated) {
      return
    }
  
    const { instruments } = this.state;
  
    const updateInstrumentQuote = async (instrument, i) => {
      const delayIncrement = 15000; // Delay between requests in ms (15s)
      await new Promise((resolve) => setTimeout(resolve, i * delayIncrement))

      const getInstrumentsUrl = `/.netlify/functions/getInstruments?symbol=${instrument.ticker}`
      return fetch(getInstrumentsUrl)
        .then(response => response.json())
        .then(data => {
          instrument.quote = data["Global Quote"]["05. price"];
        })
    }
  
    const updateIntrumentsPromises = instruments.map((instrument, i) =>
      updateInstrumentQuote(instrument, i).catch(error => {
        // eslint-disable-next-line no-console
        console.error(`Error updating instrument ${instrument.ticker}:`, error);
      })
    )
  
    Promise.allSettled(updateIntrumentsPromises).then(() => {
      this.setState({
        instruments,
        instrumentsUpdated: true,
      })
    })
  }
  

  updateQuantity(evt) {
    const {
      currentTarget: {
        dataset: { index },
      },
    } = evt

    let value = parseInt(evt.target.value) || 0

    let pageData = this.state
    pageData.instruments[index].quantity = value

    this.recalculatePageData(pageData)
  }

  recalculatePageData(pageData) {
    pageData.capital = pageData.instruments.reduce(
      (accumulator, instrument) => {
        return instrument.quantity !== ""
          ? accumulator + instrument.quote * instrument.quantity
          : accumulator
      },
      0
    )

    pageData.instruments.map((instrument) => {
      instrument.calculatedDistribution =
        ((instrument.quote * instrument.quantity) / pageData.capital) * 100
      instrument.diffDistribution =
        instrument.calculatedDistribution - instrument.targetDistribution
      instrument.diffAllocation = Math.floor(
        ((instrument.diffDistribution / 100) * pageData.capital) /
          instrument.quote
      )
      if (isNaN(parseInt(instrument.diffAllocation))) {
        instrument.diffAllocation = 0
      }
      return instrument
    })

    this.setState({
      capital: this.roundTo2decimals(pageData.capital),
      instruments: pageData.instruments,
    })
  }

  roundTo2decimals(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100
  }

  renderTableData(instruments) {
    return instruments.map((instrument, index) => {
      const {
        name,
        ticker,
        quote,
        calculatedDistribution,
        targetDistribution,
        diffAllocation,
        quantity,
      } = instrument
      return (
        <tr key={ticker}>
          <td>{name}</td>
          <td>
            <ContentEditable
              html={quantity.toString()}
              data-index={index}
              disabled={false}
              onChange={this.updateQuantity}
            />
          </td>
          <td>{diffAllocation}</td>
          <td>{this.roundTo2decimals(calculatedDistribution || 0)}%</td>
          <td>{targetDistribution}%</td>
          <td>{this.roundTo2decimals(quote)}</td>
        </tr>
      )
    })
  }

  render() {
    return (
      <>
        <div className="content">
          <div className="left-col">
            <div className="info">
              <h2>How does the rebalancer work?</h2>
              <p>
                Enter the quantities of each asset in your possession to
                calculate the adjustments needed to align with a portfolio
                modeled after Ray Dalio&apos;s All Weather Portfolio strategy,
                customized for the European market.
              </p>
              <input
                className="investment-input"
                disabled={true}
                type="text"
                name="capital"
                placeholder="Enter your investment capital"
                value={this.state.capital}
              />
            </div>
            <div className="arrow" style={{left: "700px"}}>
              <img
                src="arrow.png"
                alt="arrow"
                style={{ transform: "rotate(270deg)" }}
              />
            </div>
          </div>
          <div className="right-col">
            <img src="infographic-bg.png" alt="infographic" />
          </div>
        </div>
        <div className="center-col">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Diff Allocation</th>
                <th>Current Allocation</th>
                <th>Allocation target</th>
                <th>Quote</th>
              </tr>
            </thead>
            <tbody>{this.renderTableData(this.state.instruments)}</tbody>
          </table>
        </div>
      </>
    )
  }
}

export default Rebalancer
