import React from 'react';

import { ethers } from 'ethers';
import axios from 'axios';

import { NoWalletDetected } from './NoWalletDetected';
import { ConnectWallet } from './ConnectWallet';
import { Loading } from './Loading';

import { ERC20 as ERC20Abi } from '../abis';

// state for this Dapp
interface DappState {
  selectedAddress: undefined;
  networkError: undefined | string;

  balanceAccessToken: undefined | number;
  balanceUZHETH: undefined | number;

  isRegistered: boolean;
  nftFeatures: string;
}

export class Dapp extends React.Component<{}, DappState> {
  initialState: DappState;
  _provider: any;
  _token: any;
  _pollDataInterval: any;

  constructor(props: any) {
    super(props);

    this.initialState = {
      selectedAddress: undefined,
      networkError: undefined,

      balanceAccessToken: undefined,
      balanceUZHETH: undefined,

      isRegistered: false,
      nftFeatures: '',
    };
    this.state = this.initialState;

    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  render() {
    // when there is no wallet extension
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // when there is no address connected
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // loading
    if (
      this.state.balanceAccessToken === undefined ||
      this.state.balanceUZHETH === undefined
    ) {
      return <Loading />;
    }

    // the main page
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <p> Welcome {this.state.selectedAddress}, </p>
            <p>
              {' '}
              you currently have {this.state.balanceUZHETH.toString()} UZHETH.{' '}
            </p>
            <p>
              {' '}
              you currently have {this.state.balanceAccessToken.toString()}{' '}
              access tokens.{' '}
            </p>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12">
            <p>
              {this.state.isRegistered
                ? 'You have already been registered'
                : 'Click the button below to register'}
            </p>
            <button
              type="button"
              className="btn btn-success"
              onClick={() => this._register()}
              disabled={this.state.isRegistered}
            >
              Register
            </button>
          </div>
        </div>

        {this.state.balanceAccessToken > 0 ? (
          <div className="row mt-5">
            <div className="col-12">
              <form onSubmit={this._handleSubmit}>
                <label>NFT configuration:</label>
                <input
                  type="textarea"
                  className="form-control"
                  placeholder="Here we type in some features"
                  onChange={this._handleChange}
                />
                <br />
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!(await this._checkNetwork())) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on('accountsChanged', ([newAddress]: any) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on('chainChanged', ([networkId]: any) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress: any) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
    this._startPollingData();

    // Custom functions for the PoC
    this._getRegisteredState();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _updateBalance() {
    // balance of the access token
    const res = await axios.get(
      `http://localhost:3001/web3/balance/${this.state.selectedAddress}`,
    );
    this.setState({ balanceAccessToken: res.data });

    // balance of UZHETH
    const balanceWei = await this._provider.getBalance(
      this.state.selectedAddress,
    );
    const balance = ethers.utils.formatEther(balanceWei);
    this.setState({ balanceUZHETH: parseFloat(balance) });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error: any) {
    if (error.data) {
      return error.data.message;
    }
    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if we are connected to the right chain
  async _checkNetwork() {
    if (
      window.ethereum.chainId === process.env.REACT_APP_CHAIN_ID!.toString()
    ) {
      return true;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: process.env.REACT_APP_CHAIN_ID!.toString() }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: process.env.REACT_APP_CHAIN_ID,
                chainName: process.env.REACT_APP_CHAIN_NAME,
                rpcUrls: [process.env.REACT_APP_RPC_URL],
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
          console.error('Chain configuration could not be parsed.');
        }
      }
      // handle other "switch" errors
      console.error(
        `Could not switch chain to ${process.env.REACT_APP_CHAIN_NAME}`,
      );
      this.setState({
        networkError: `Please add the ${process.env.REACT_APP_CHAIN_NAME} chain to Metamask.`,
      });
    }

    this.setState({ networkError: undefined });

    return false;
  }

  // Custom functions for the PoC
  async _register() {
    const data = { address: this.state.selectedAddress };
    const response = await axios.post(`http://localhost:3001/web3/mint`, data);
    console.log(response);
  }

  async _getRegisteredState() {
    const response = await axios.get(
      `http://localhost:3001/web3/registry/${this.state.selectedAddress}`,
    );
    this.setState({ isRegistered: response.data });
  }

  async _handleSubmit(event: any) {
    event.preventDefault();
    const accessToken = new ethers.Contract(
      process.env.REACT_APP_NFT_TOKEN_ADDRESS as string,
      ERC20Abi,
      this._provider.getSigner(0),
    );
    const response = await accessToken.burnWith(
      this.state.selectedAddress,
      this.state.nftFeatures,
    );
    console.log(response);
  }

  async _handleChange(event: any) {
    this.setState({ nftFeatures: event.target!.value });
  }
}
