import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import ausBG from './img/aus-outline.png';
import ausBG from './img/aus-outline-outline-5-greybg.png';
import ausStarsOverlay from './img/aus-stars-overlay-black.png';
import example1 from './img/example1.png';
import './App.css';
import { Grid, Row, Col, ButtonToolbar, Button, ToggleButtonGroup, ToggleButton, FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';
import Select from 'react-select';
import ShortId from 'js-shortid';

const COUNTRIES = [
	{ label: 'Brazil', value: 'br' },
	{ label: 'Canada', value: 'ca' },
  { label: 'China', value: 'cn' },
  { label: 'India', value: 'in' },
  { label: 'Sri Lanka', value: 'lk' },
  { label: 'Malaysia', value: 'my' },
	{ label: 'New Zealand', value: 'nz' },
	{ label: 'US', value: 'us' },
	{ label: 'Vietnam', value: 'vn' },
];

let countryCodeMap = {
  br: {country: 'Brazil', imgAlignToX: 'left', imgAlignToY: 'top'},
  ca: {country: 'Canada', imgAlignToX: 'center', imgAlignToY: 'center'},
  cn: {country: 'China', imgAlignToX: 'left', imgAlignToY: 'top'},
  in: {country: 'India', imgAlignToX: 'center', imgAlignToY: 'center'},
  lk: {country: 'Sri Lanka', imgAlignToX: 'right', imgAlignToY: 'center'},
  my: {country: 'Malaysia', imgAlignToX: 'center', imgAlignToY: 'top'},
  nz: {country: 'New Zealand', imgAlignToX: 'center', imgAlignToY: 'top'},
  us: {country: 'US', imgAlignToX: 'left', imgAlignToY: 'top'},
  vn: {country: 'Vietnam', imgAlignToX: 'left', imgAlignToY: 'top'},
}

var PayPalButton = null;
const UNITPRICE = '19.00';
const DISCOUNT = .10;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      viewId: 3,
      roots: [],
      stickerOptionsShowMyRoots: true,
      stickerOptionsShowStarOverlay: true,
      stickerOrderOptionsQty: 1,
      stickerOrderTotalPrice: UNITPRICE,
      stickerOrderDiscountApplied: 0,
      stickerOrderNumber: 'na',
      stickerOrderCountries: [],
      orderFullName: '',
      orderEmail: '',
      orderPhone: '',
      orderStreetAddress: '',
      orderSuburb: '',
      orderPostcode: '',
      orderState: '',
      env: 'sandbox',
      client: {
          sandbox:    'AWi18rxt26-hrueMoPZ0tpGEOJnNT4QkiMQst9pYgaQNAfS1FLFxkxQuiaqRBj1vV5PmgHX_jA_c1ncL',
          production: '<insert production client id>'
      },
      style: {
        size: 'responsive',
        color: 'gold',
        shape: 'pill',
        label: 'checkout'
      },
      locale: 'en_US',
      commit: true
    }
  }

  componentDidMount() {}

  _payment(data, actions) {
     return actions.payment.create({
       transactions: [
         {
             amount: { total: this.state.stickerOrderTotalPrice, currency: 'AUD' }
         }
       ]
     });
   }

   _onAuthorize(data, actions) {
     return actions.payment.execute().then(function(paymentData) {
         // Show a success page to the buyer
     });
   }

  _addFlag (value) {
    let selectedCountries = [];

    if (value === '') {
      selectedCountries = [];
    }
    else if (value.indexOf(',') > -1) {
      selectedCountries = value.split(',');
    }
    else {
      selectedCountries = [ value ];
    }

    if (selectedCountries.length === 4) {
      alert('Sorry only 3 countries allowed at the moment!');
      return;
    }

    let newRoots = selectedCountries.map((i) => {
      return {
        country: countryCodeMap[i].country,
        countryCode: i,
        imgUrl: require(`./img/flags/${i}.png`),
        imgAlignToX: countryCodeMap[i].imgAlignToX,
        imgAlignToY: countryCodeMap[i].imgAlignToY
      };
    })

    this._orderStorageCountries(newRoots);

    this.setState({
      roots: newRoots
    });
	}

  _shuffleFlags() {
    let newRoots = [...this.state.roots];

    newRoots = shuffle(newRoots);

    this._orderStorageCountries(newRoots);

    this.setState({
      roots: newRoots
    });
  }

  _orderStorageCountries(newRoots) {
    this.setState({
      stickerOrderCountries: newRoots.map(i => i.countryCode)
    });
  }

  _updateQty(isUp) {
    let newQty = this.state.stickerOrderOptionsQty;
    let newTotalPrice = this.state.stickerOrderTotalPrice;
    let savedViaDiscount = this.state.stickerOrderDiscountApplied;

    newQty = (((isUp) ? ++newQty : --newQty) === 0) ? 1 : newQty;
    newTotalPrice = newQty * UNITPRICE;

    // apply discount if Needed
    if (newQty > 1) {
      savedViaDiscount = (newTotalPrice * DISCOUNT).toFixed(2); // gives you a nice string with 2 decimal points (12.40) - keep like this so UI looks good
      newTotalPrice = newTotalPrice - parseFloat(savedViaDiscount); // parse savedViaDiscount to float so we can calculate
    }

    newTotalPrice = newTotalPrice.toFixed(2);

    this.setState({
      stickerOrderOptionsQty: newQty,
      stickerOrderTotalPrice: newTotalPrice,
      stickerOrderDiscountApplied: savedViaDiscount
    });
  }

  _navigateWorkflow(toStep, isFront, orderStart) {
    let nextStep;

    if (!isNaN(parseInt(toStep, 10))) {
      nextStep = toStep;
    }
    else {
      nextStep = this.state.viewId;

      if (isFront) {
        ++nextStep;
      }
      else {
        --nextStep;
      }

      if (nextStep === 4) {
        nextStep = 3;
      }
      else if (nextStep === 0) {
        nextStep = 1;
      }
    }

    if (nextStep === 3) {
       PayPalButton = paypal.Button.driver('react', { React, ReactDOM }); // eslint-disable-line
    }

    this.setState({
      viewId: nextStep
    });

    if (orderStart) { // reset the order
      this.setState({
        roots: [],
        stickerOptionsShowMyRoots: true,
        stickerOptionsShowStarOverlay: true,
        stickerOrderOptionsQty: 1,
        stickerOrderTotalPrice: UNITPRICE,
        stickerOrderDiscountApplied: 0,
        stickerOrderNumber: ShortId.gen(),
        stickerOrderCountries: []
      });
    }
  }

  render() {
    return (
      <Grid className="App" fluid={true}>
        <Row className="Header">
          <Col xs={12} sm={12} md={12} lg={12}>
            <h1>{`I'm Loving Australia`} - Stickers</h1>
          </Col>
        </Row>

        <div className="Body">
          <div className="Splash" style={{display: (this.state.viewId === 0) ? 'block' : 'none'}}>
            <Row>
              <Col xs={12} sm={12} md={12} lg={6}>
                <h2>
                  We love Australia. <br/>We love our Multicultural Society. <br/>We love our Foreign Roots and Culture.
                </h2>

                <h3>
                  Show your love for Australia and celebrate your roots with your very own custom designed "Loving Australia" Car Sticker.
                </h3>

                <div style={{padding: '10px'}}></div>

                <Button className="btn-xl" bsStyle="default" bsSize="large" onClick={ this._navigateWorkflow.bind(this, 1, null, true) } >
                  Create Your Sticker Now
                </Button>
              </Col>

              <Col className="egImg" xs={12} sm={12} md={12} lg={6}>
                <div className="example1" style={{backgroundImage: 'url('+example1+')'}}></div>
              </Col>
            </Row>

            <Row>
              <Col className="" xs={12} sm={12} md={12} lg={6}>
                <h4>#lovingaustralia</h4>
                Show you support for the Loving Australia movement by sharing social media posts using the hashtag #lovingaustralia
              </Col>
            </Row>
          </div>

          <div className="Sticker-Maker" style={{display: (this.state.viewId > 0) ? 'block' : 'none'}}>
            <div className="workflow">
              <Row>
                <Col xs={12} sm={12} md={6} lg={6}>
                  <ButtonToolbar>
                    <Button bsStyle={this.state.viewId === 1 ? 'primary' : 'default'} bsSize="large" onClick={this._navigateWorkflow.bind(this, 1, null, null)}> Step 1 - Design</Button>
                    <Button bsStyle={this.state.viewId === 2 ? 'primary' : 'default'} bsSize="large" onClick={this._navigateWorkflow.bind(this, 2, null, null)}> Step 2 - Quantity</Button>
                    <Button bsStyle={this.state.viewId === 3 ? 'primary' : 'default'} bsSize="large" onClick={this._navigateWorkflow.bind(this, 3, null, null)}> Step 3 - Place Order</Button>
                  </ButtonToolbar>
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                  <ButtonToolbar className="pull-right">
                    <Button bsStyle="default" bsSize="large" onClick={this._navigateWorkflow.bind(this, 0, null, null)}>Back Home</Button>
                    <Button bsStyle="default" bsSize="large" disabled>{`Order Number: ${this.state.stickerOrderNumber}`}</Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </div>

            <div className="Order">
              <Row style={{display: (this.state.viewId === 1) ? 'block' : 'none'}}>
                <Col xs={12} sm={12} md={12} lg={12}>
                  <div className="Intro">
                    <div>Step 1: Design Your Sticker</div>
                  </div>
                </Col>
              </Row>

              <Row style={{display: (this.state.viewId === 2) ? 'block' : 'none'}}>
                <Col xs={12} sm={12} md={12} lg={12}>
                  <div className="Intro">
                    <div>Step 2: How many stickers would you like?</div>
                  </div>
                </Col>
              </Row>

              <Row style={{display: (this.state.viewId === 3) ? 'block' : 'none'}}>
                <Col xs={12} sm={12} md={12} lg={12}>
                  <div className="Intro">
                    <div>Step 3: Securely pay for your order</div>
                  </div>
                </Col>
              </Row>

              <Row className="Tools">
                <Col xs={12} sm={12} md={12} lg={6}>
                  {
                    (this.state.viewId === 1)
                    ?
                      <div className="designSticker">
                        <div className="pickCountries">
                          <div>What is your origin or family Origin<br/><span className="expl">(you can select up to 3 countries)</span></div>

                          <Select
                            className="selectBox"
                            multi
                            onChange={this._addFlag.bind(this)}
                            options={ COUNTRIES }
                            placeholder="Select Countries..."
                            removeSelected={true}
                            rtl={false}
                            simpleValue
                            value={ this.state.roots.map(i => i.countryCode) }
                          />
                        </div>

                        {
                          (this.state.roots.length > 0)
                          ?
                            <div className="customiseMore">
                              <div className="subTitle">Customise Your Design</div>

                              <div className="showMyRoots">
                                <ToggleButtonGroup
                                  type="radio"
                                  name="showMyRoots"
                                  value={this.state.stickerOptionsShowMyRoots}
                                  onChange={(newVal) => this.setState({stickerOptionsShowMyRoots: newVal})}>

                                  <ToggleButton bsSize="large" value={true}>Show "My Roots"</ToggleButton>
                                  <ToggleButton bsSize="large" value={false}>Hide "My Roots"</ToggleButton>
                                </ToggleButtonGroup>
                              </div>

                              <div className="removeStarOverlay">
                                <ToggleButtonGroup
                                  type="radio"
                                  name="removeStarOverlay"
                                  value={this.state.stickerOptionsShowStarOverlay}
                                  onChange={(newVal) => this.setState({stickerOptionsShowStarOverlay: newVal})}>

                                  <ToggleButton bsSize="large" value={true}>Show "Stars" Overlay</ToggleButton>
                                  <ToggleButton bsSize="large" value={false}>Hide "Stars" Overlay</ToggleButton>
                                </ToggleButtonGroup>
                              </div>

                              {
                                (this.state.roots.length > 1)
                                ?
                                  <Button className="shuffleArray" bsStyle="default" bsSize="large" onClick={this._shuffleFlags.bind(this)}>Swap Order of Flags</Button>
                                :
                                  null
                              }
                            </div>
                          :
                            null
                        }
                      </div>
                    :
                      null
                  } { /* Step 1 - designSticker */ }

                  {
                    (this.state.viewId === 2 || this.state.viewId === 3)
                    ?
                      <div className="previewAndOrder">
                        {
                          (this.state.viewId === 2)
                          ?
                            <div className="subTitle">Preview your sticker tell us how many you would like.</div>
                          :
                            <div className="subTitle">You can use PayPal to make a secure payment using your PayPal account OR any Credit Card</div>
                        }

                        <div className="orderTotal">
                          <div className="subTitle">Your total cost for this order is:</div>
                          <div className="price">${this.state.stickerOrderTotalPrice} AUD</div>
                          <div className="smallest">* Free shipping Australia Wide</div>
                          <div className="discount">
                            {
                              (this.state.stickerOrderOptionsQty > 1)
                                ?
                                  <span>* ${this.state.stickerOrderDiscountApplied} AUD discount applied as you are ordering more than 1 sticker!</span>
                                :
                                  <span>* Buy more than 1 Sticker and get 10% off your total price!</span>
                            }
                          </div>
                        </div>

                        {
                          (this.state.viewId === 2)
                          ?
                            <div className="qtySelector">
                              <div className="subTitle">Stickers Needed:</div>

                              <div className="upDownTool">
                                <div className={["go", "noselect"].join(' ')} onClick={this._updateQty.bind(this, false)}>LESS</div>
                                <div className="qty">{this.state.stickerOrderOptionsQty}</div>
                                <div className={["go", "noselect"].join(' ')} onClick={this._updateQty.bind(this, true)}>MORE</div>
                              </div>
                            </div>
                          :
                            <div>
                              {
                                (this.state.viewId === 3)
                                ?
                                  <div className="yourDetails">
                                    <div className="subTitle">Your Details</div>

                                    <FormGroup bsSize="large">
                                      <ControlLabel>Full Name</ControlLabel>
                                      <FormControl type="text" placeholder="e.g. John Doe" value={this.state.orderFullName} onChange={e => {this.setState({orderFullName: e.target.value})}} />
                                    </FormGroup>

                                    <FormGroup bsSize="large">
                                      <ControlLabel>Email</ControlLabel>
                                      <FormControl type="email" placeholder="e.g. john@email.com" value={this.state.orderEmail} onChange={e => {this.setState({orderEmail: e.target.value})}} />
                                      <HelpBlock className='small'>We will send you a receipt to this email address. We will never share it or spam you. Ever!</HelpBlock>
                                    </FormGroup>

                                    <FormGroup bsSize="large">
                                      <ControlLabel>Phone Number</ControlLabel>
                                      <FormControl type="text" placeholder="04112343432" value={this.state.orderPhone} onChange={e => {this.setState({orderPhone: e.target.value})}} />
                                      <HelpBlock className='small'>We will ring ONLY you if we need to urgently confirm any order details.</HelpBlock>
                                    </FormGroup>

                                    <div className="subTitleSecond">Postage Address</div>

                                    <FormGroup bsSize="large">
                                      <ControlLabel>Full Street Address</ControlLabel>
                                      <FormControl type="text" placeholder="e.g. Unit 2, Random Street" value={this.state.orderStreetAddress} onChange={e => {this.setState({orderStreetAddress: e.target.value})}} />
                                    </FormGroup>

                                    <FormGroup bsSize="large">
                                      <ControlLabel>Suburb</ControlLabel>
                                      <FormControl type="text" placeholder="e.g. Ashfield" value={this.state.orderSuburb} onChange={e => {this.setState({orderSuburb: e.target.value})}} />
                                    </FormGroup>

                                    <FormGroup bsSize="large">
                                      <ControlLabel>Postcode</ControlLabel>
                                      <FormControl type="text" placeholder="1234" value={this.state.orderPostcode} onChange={e => {this.setState({orderPostcode: e.target.value})}} />
                                    </FormGroup>

                                    <FormGroup bsSize="large">
                                      <ControlLabel>State</ControlLabel>
                                      <FormControl componentClass="select" placeholder="select" value={this.state.orderState} onChange={e => {this.setState({orderState: e.target.value})}} >
                                				<option value="select">select</option>
                                				<option value="NSW">NSW</option>
                                				<option value="VIC">VIC</option>
                                				<option value="QLD">QLD</option>
                                				<option value="VIC">VIC</option>
                                				<option value="WA">WA</option>
                                				<option value="ACT">ACT</option>
                                        <option value="TAZ">TAZ</option>
                                				<option value="SA">SA</option>
                                				<option value="NT">NT</option>
                                			</FormControl>
                                    </FormGroup>

                                    <FormGroup bsSize="large">
                                      <ControlLabel>Country</ControlLabel>
                                      <FormControl type="text" placeholder="Australia" disabled={true} />
                                    </FormGroup>
                                  </div>
                                :
                                  <div className="paypalBtn">
                                    <PayPalButton
                                      commit={ this.state.commit }
                                      env={ this.state.env }
                                      locale={ this.state.locale }
                                      style={ this.state.style }
                                      client={ this.state.client }
                                      payment={ (data, actions) => this._payment(data, actions) }
                                      onAuthorize={ (data, actions) => this._onAuthorize(data, actions) }
                                    />
                                  </div>
                              }
                            </div>
                        }
                      </div>
                    :
                      null
                  } { /* Step 2 - previewAndOrder */ }


                </Col>

                <Col className="Preview" xs={12} sm={12} md={12} lg={6}>
                  <div className="title">Sticker Preview</div>

                  <div className="canvas">
                    <div className="FlagsHolder">
                      {
                        (this.state.roots.length > 0)
                        ?
                          this.state.roots.map((i, idx) => {
                            return <div
                                      className="Flags"
                                      key={idx}
                                      style={{
                                          backgroundImage: 'url('+i.imgUrl+')',
                                          height: `${Math.floor(500/this.state.roots.length)}px`,
                                          backgroundPositionX: i.imgAlignToX,
                                          backgroundPositionY: i.imgAlignToY
                                      }}></div>
                          })
                        :
                          <div>Nothing Yet!</div>
                      }
                    </div>

                    {
                      (this.state.stickerOptionsShowStarOverlay)
                      ?
                          <div className="Aus-Starts-Overlay" style={{backgroundImage: 'url('+ausStarsOverlay+')'}}></div>
                      :
                        null
                    }

                    <div className="Aus-Overlay" style={{backgroundImage: 'url('+ausBG+')'}}></div>
                    <div className="lovingTag">Loving Australia</div>

                    {
                      (this.state.roots.length > 0 && this.state.stickerOptionsShowMyRoots)
                      ?
                        <div>
                          <div className="andRootsNameTag">My Roots</div>
                          <div className="andRootsListTag">
                            {
                              this.state.roots.map((i, idx) => {
                                return <div
                                          className="rootFlagSml"
                                          key={idx}
                                          style={{ backgroundImage: 'url('+i.imgUrl+')' }}></div>
                              })
                            }
                          </div>
                        </div>
                      :
                        null
                    }
                  </div>
                </Col>
              </Row> { /* Tools */}

              <Row className="nextPrevButtons">
                <Col xs={12} sm={12} md={12} lg={12}>
                  <Button className="btn-xl" bsStyle="default" bsSize="large" onClick={this._navigateWorkflow.bind(this, null, true, null)}>Save and Proceed</Button>
                </Col>
              </Row>
            </div>

          </div> { /* Sticker-Maker */ }
        </div>

        <Row className="Footer">
          <Col xs={12} sm={12} md={12} lg={12}>
            Footer
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default App;
