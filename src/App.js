import React, { Component } from "react";
import "./App.css";
import { defaultInstruments } from "./utils/constants";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      capital: 10000,
      instrumentsUpdated: true,
      instruments: defaultInstruments,
      lastUpdate: new Date(),
    };
  }

  async componentDidMount() {
    if (this.state.instrumentsUpdated) {
      return;
    }

    const { instruments } = this.state;

    const updateInstrumentPromises = instruments.map((instrument, i) => {
      const delayIncrement = 15000; // Delay between requests in ms (15s)
      const getInstrumentsUrl = `/.netlify/functions/getInstruments?symbol=${instrument.ticker}`;

      return new Promise((resolve) => setTimeout(resolve, i * delayIncrement))
        .then(() => fetch(getInstrumentsUrl))
        .then((response) => response.json())
        .then((response) => {
          instrument.quote = response["Global Quote"]["05. price"];
        })
      });
        
        try {
          await Promise.all(updateInstrumentPromises);
          this.setState({
            instruments,
            instrumentsUpdated: true,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error updating instruments:', error);
        }
  }

  renderTableData(instruments) {
    return instruments.map((instrument) => {
      const { name, ticker, quote, distribution } = instrument; //destructuring
      const availability = this.state.capital * (distribution / 100);
      const quantity = Math.floor(availability / quote);

      return (
        <tr key={ticker}>
          <td>{name}</td>
          <td>{ticker}</td>
          <td>{quote}</td>
          <td>{distribution}%</td>
          <td>{quantity}</td>
        </tr>
      );
    });
  }

  render() {
    return (
      <>
        <div className="content">
          <div className="left-col">
            <div className="info">
              <h2>How does it work?</h2>
              <p>
                Input your desired investment amount and discover the potential
                allocation based on Ray Dalio&apos;s All Weather Portfolio, tailored
                for the European market.
              </p>
              <input
                className="investment-input"
                type="text"
                name="capital"
                placeholder="Enter your investment capital"
                onChange={(e) => this.setState({ capital: parseInt(e.target.value) > 0 ? parseInt(e.target.value) : 0  })}
                value={this.state.capital}
              />
            </div>
            <div className="arrow">
              <img src="arrow.png" alt="arrow" />
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
                <th>Asset Allocation</th>
                <th>Ticker</th>
                <th>Quote</th>
                <th>Allocation target</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>{this.renderTableData(this.state.instruments)}</tbody>
          </table>
        </div>
      </>
    );
  }
}

export default App
