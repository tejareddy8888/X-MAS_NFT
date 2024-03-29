import React, { ChangeEvent } from 'react';

import { ethers, BigNumber, constants } from 'ethers';
import axios from 'axios';
import Table from 'react-bootstrap/Table';

import { NoWalletDetected } from './NoWalletDetected';
import { ConnectWallet } from './ConnectWallet';
import { Loading } from './Loading';

import { ERC20 as ERC20Abi } from '../abis';
import { ERC721 as ERC721Abi } from '../abis';

// state for this Dapp
interface DappState {
  selectedAddress: undefined | string;
  networkError: undefined | string;
  balanceAccessToken: string;
  balanceUZHETH: number;
  isRegistered: boolean;
  nftFeatures: string;
  faucetTransactionHash: string;
  nftMintingHash: string;
  uploadingNFT: boolean;
  starPosition: string;
  nftTokenBalance: number;
  file: undefined | File;
  image: string;
  imageURL: string;
  ipfsCid: string;
  nftTransfer: string;
}

export class Dapp extends React.Component<{}, DappState> {
  initialState: DappState;
  _provider: any;
  _token: any;
  _pollOneSecInterval: any;
  _poll10SecInterval: any;
  myRef: any;

  constructor(props: any) {
    super(props);

    this.myRef = React.createRef();
    this.initialState = {
      selectedAddress: undefined,
      networkError: undefined,

      balanceAccessToken: '0',
      balanceUZHETH: 0,
      nftTokenBalance: 0,

      isRegistered: false,
      nftFeatures: '',

      uploadingNFT: false,

      starPosition: '',
      file: undefined,
      image: '',
      imageURL: '',
      ipfsCid: '',
      faucetTransactionHash: '',
      nftMintingHash: '',
      nftTransfer: 'true',
    };
    this.state = this.initialState;

    this.updatedStarPosition = this.updatedStarPosition.bind(this);
    this.burnToken = this.burnToken.bind(this);
    this.setImage = this.setImage.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.sendNFT = this.sendNFT.bind(this);
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
              onClick={() => this.faucetRegister()}
              disabled={this.state.isRegistered}
            >
              Register
            </button>
          </div>
        </div>

        {this.state.faucetTransactionHash && (
          <div className="col-12">
            <p>
              {' '}
              Successfully registered and mint the ETH in this transaction{' '}
              {this.state.faucetTransactionHash},{' '}
            </p>
          </div>
        )}

        {BigNumber.from(this.state.balanceAccessToken).gt(0) ? (
          <div className="row mt-5">
            <div className="col-12">
              <form onSubmit={this.burnToken}>
                <label>NFT configuration:</label>
                <input
                  type="textarea"
                  className="form-control"
                  placeholder="Here we type in some features"
                  onChange={this.updatedStarPosition}
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

        {BigNumber.from(this.state.balanceAccessToken).eq(0) &&
        this.state.isRegistered ? (
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Address</th>
                <th>StarPosition</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{this.state.selectedAddress}</td>
                <td>{this.state.starPosition}</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <></>
        )}

        {/* {this.state.image && (
          <img
            src={`data:image/jpeg;charset=utf-8;base64,${this.state.image}`}
          />
        )} */}

        {/* <div>
          <form onSubmit={this.uploadImage}>
            <div>
              <h1>Ipfs File Upload</h1>
            </div>
            <div>
              <input type="file" onChange={this.setImage} />
            </div>
            <div>
              <button type="submit">Upload</button>
            </div>
          </form>
        </div> */}

        {this.state.uploadingNFT ? (
          <div>
            <form onSubmit={this.uploadImage}>
              <div>
                <h1>MINT NFT by Uploading</h1>
              </div>
              <div>
                <input type="file" onChange={this.setImage} />
              </div>
              <div>
                <button type="submit">Upload</button>
              </div>
            </form>
          </div>
        ) : (
          <></>
        )}

        {this.state.nftTokenBalance && (
          <div className="col-12">
            <p>
              {' '}
              Successfully uploaded the image in IPFS with{' '}
              {`http://${this.state.ipfsCid}.ipfs.dweb.link`},{' '}
            </p>
          </div>
        )}

        {this.state.nftMintingHash && (
          <div className="col-12">
            <p>
              {' '}
              Successfully mint the image in transaction{' '}
              {this.state.nftMintingHash},{' '}
            </p>
          </div>
        )}

        {this.state.nftTransfer && (
          <div className="row mt-5">
            <div className="col-12">
              <input type="text" placeholder="address" ref={this.myRef} />
              <button
                type="submit"
                className="btn btn-primary"
                onClick={this.sendNFT}
              >
                Transfer
              </button>
            </div>
          </div>
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

    console.log(selectedAddress);
    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!(await this._checkNetwork())) {
      return;
    }

    console.log(selectedAddress);
    await this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    await window.ethereum.on('accountsChanged', async ([newAddress]: any) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      console.log(newAddress);
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._resetState();
      await this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on('chainChanged', ([networkId]: any) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  async _initialize(userAddress: any) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    if (process.env.REACT_APP_NFT_TOKEN_ADDRESS) {
      this.setState({ uploadingNFT: true });
    }

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._initializeEthers();
    await this._startPollingData();
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
  async _startPollingData() {
    this._pollOneSecInterval = setInterval(
      () => this.pollingOneSecCalls(),
      5000,
    );
    this._poll10SecInterval = setInterval(
      () => this.polling10SecCalls(),
      15000,
    );

    // We run it once immediately so we don't have to wait for it
    await this.pollingOneSecCalls();
  }

  _stopPollingData() {
    clearInterval(this._pollOneSecInterval);
    this._pollOneSecInterval = undefined;
  }

  async pollingOneSecCalls() {
    await this._updateBalance();
  }

  async polling10SecCalls() {
    await this.getRegisteredState();
    // await this.retrieveStarPosition();
    await this.retrieveMintedNFT();
  }

  async _updateBalance() {
    const accessToken = new ethers.Contract(
      process.env.REACT_APP_ACCESS_TOKEN_ADDRESS as string,
      ERC20Abi,
      this._provider.getSigner(),
    );
    // balance of the access token
    const res = BigNumber.from(
      await accessToken.balanceOf(this.state.selectedAddress),
    )
      .mul(BigNumber.from(10).pow(18))
      .toString();

    this.setState({ balanceAccessToken: res });

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
    console.log(window.ethereum.chainId);
    if (window.ethereum.chainId == process.env.REACT_APP_CHAIN_ID!.toString()) {
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
                chainId: '0x22b8',
                chainName: 'UZHETHPoS',
                nativeCurrency: {
                  name: 'UZH Ethereum PoS',
                  symbol: 'UZETHs',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.uzheths.ifi.uzh.ch'],
                blockExplorerUrls: ['https://uzheths.ifi.uzh.ch'],
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
  async faucetRegister() {
    const data = { address: this.state.selectedAddress };
    const response = await axios.post(
      process.env.REACT_APP_BACKEND_API_URL + `/web3/faucet`,
      data,
    );

    this.setState({ faucetTransactionHash: response.data });
  }

  async getRegisteredState() {
    const response = await axios.get(
      process.env.REACT_APP_BACKEND_API_URL +
        `/web3/registry/${this.state.selectedAddress}`,
    );
    this.setState({ isRegistered: response.data });
  }

  async burnToken(event: any) {
    event.preventDefault();
    const accessToken = new ethers.Contract(
      process.env.REACT_APP_ACCESS_TOKEN_ADDRESS as string,
      ERC20Abi,
      this._provider.getSigner(),
    );
    const response = await accessToken.burnWith(this.state.nftFeatures);
    console.log(response);
  }

  async updatedStarPosition(event: any) {
    this.setState({ nftFeatures: event.target!.value });
  }

  async retrieveStarPosition() {
    if (
      BigNumber.from(this.state.balanceAccessToken ?? 1).eq(0) &&
      this.state.isRegistered
    ) {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_API_URL +
          `/web3/starDetails/${this.state.selectedAddress}`,
      );
      this.setState({ starPosition: response.data });
    }
  }

  setImage(file: ChangeEvent) {
    const { files } = file.target as HTMLInputElement;
    if (files && files.length !== 0) {
      this.setState({ file: files[0] });
    }
  }

  async uploadImage(event: any) {
    event.preventDefault();
    var formData = new FormData();
    // @ts-ignore
    formData.append('photo', this.state.file, 'test');
    console.log(formData.entries(), formData.entries().next());
    const ipfsCid = await axios
      .post(
        process.env.REACT_APP_BACKEND_API_URL + '/web3/ipfs/upload',
        formData,
      )
      .then((response) => {
        console.log(response.data);
        return response.data;
      });

    this.setState({ ipfsCid });

    console.log(`uploaded image at ipfscid: ${ipfsCid}`);

    const nftMintHash = await axios
      .post(process.env.REACT_APP_BACKEND_API_URL + '/web3/nft/mint', {
        address: this.state.selectedAddress,
        ipfsCid,
      })
      .then((response) => {
        console.log(response.data);
        return response.data;
      });

    console.log(`uploaded image at ipfscid: ${nftMintHash}`);
    this.setState({ nftMintingHash: nftMintHash });
  }

  async retrieveMintedNFT() {
    console.log(`received retrive NFT call`);
    const nftToken = new ethers.Contract(
      process.env.REACT_APP_NFT_TOKEN_ADDRESS as string,
      ERC721Abi,
      this._provider.getSigner(),
    );

    const nftTokenBalance = await nftToken.balanceOf(
      this.state.selectedAddress,
    );

    this.setState({ nftTokenBalance });

    console.log(`NFT Token Balance: ${nftTokenBalance}`);

    if (BigNumber.from(this.state.nftTokenBalance).gt(0)) {
      console.log(`nft token balance is high`, this.state.nftTokenBalance);
      const nftTokenInterface = new ethers.utils.Interface(
        JSON.stringify(ERC721Abi),
      );

      const response = await nftToken.queryFilter(
        nftToken.filters.Transfer(
          constants.AddressZero,
          this.state.selectedAddress,
        ),
      );

      const parsedEvent = nftTokenInterface.parseLog(response[0]);

      const ipfsCid = await nftToken.tokenURI(parsedEvent.args.tokenId);

      this.setState({ ipfsCid });

      this.retrieveImageFromIPFSCID();
    }
  }

  async retrieveImageFromIPFSCID() {
    if (this.state.ipfsCid) {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_API_URL +
          `/web3/ipfs/${this.state.ipfsCid}`,
      );
      console.log(response.data);
      this.setState({ image: response.data });
    }

    if (this.state.nftTokenBalance) {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND_API_URL +
          `nfts/${this.state.selectedAddress}`,
      );

      this.setState({
        ipfsCid: response.data[0].ipfsURL.match(
          /https?:\/\/((.+?))?\.ipfs\.dweb\.link(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?/,
        )[1],
      });

      console.log(this.state.ipfsCid);
    }
  }

  async sendNFT(): Promise<boolean> {
    const nftToken = new ethers.Contract(
      process.env.REACT_APP_NFT_TOKEN_ADDRESS as string, // This is the NFT contract address given already
      ERC721Abi,
      this._provider.getSigner(),
    );

    const tx = await nftToken.transferFrom(
      this.state.selectedAddress, // this should be sending address, fetched from the wallet connected
      this.myRef.current.value, // this should be receiving address, retreived from the user input
      1, //this should be the NFTID here I hardcoded
    );
    console.log(`transaction object: ${tx}`);

    const txReceipt = await tx.wait(3);
    console.log(`transaction receipt: ${txReceipt}`);
    return !!txReceipt.status;
  }
}
