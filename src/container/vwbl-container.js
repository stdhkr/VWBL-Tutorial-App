import { createContainer } from 'unstated-next';
import { useState } from 'react';
import Web3 from 'web3';
import { ManageKeyType, UploadContentType, UploadMetadataType, VWBL } from 'vwbl-sdk'; //この１行を追加

const useVWBL = () => {
  const [userAddress, setUserAddress] = useState('');
  const [web3, setWeb3] = useState();
  const [vwbl, setVwbl] = useState(); // この１行を追加

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('Please install MetaMask!');
      } else {
        console.log('MetaMask is installed!', ethereum);
      }

      await ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(ethereum);
      const accounts = await web3.eth.getAccounts();
      const currentAccount = accounts[0];
      setWeb3(web3);
      setUserAddress(currentAccount);

      const connectedChainId = await web3.eth.getChainId();
      const properChainId = parseInt(process.env.REACT_APP_CHAIN_ID);
      if (connectedChainId !== properChainId) {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: web3.utils.toHex(properChainId) }],
        });
      }

      // initVwblを実行してvwblインスタンスを作成する
      initVwbl(web3);
    } catch (error) {
      if (error.code === 4001) {
        alert('Please connect Your Wallet.');
      } else {
        alert(error.message);
      }
      console.error(error);
    }
  };

  const disconnectWallet = () => {
    setUserAddress('');
    setWeb3(undefined);
    // vwblインスタンスのstateをリセット
    setVwbl(undefined);
  };

  // Lesson-3
  const initVwbl = (web3) => {
    // vwblインスタンスの作成
    const vwblInstance = new VWBL({
      web3,
      contractAddress: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
      vwblNetworkUrl: process.env.REACT_APP_VWBL_NETWORK_URL,
      manageKeyType: ManageKeyType.VWBL_NETWORK_SERVER,
      uploadContentType: UploadContentType.IPFS,
      uploadMetadataType: UploadMetadataType.IPFS,
      ipfsNftStorageKey: process.env.REACT_APP_NFT_STORAGE_KEY,
    });
    // vwblインスタンスをstateを保存
    setVwbl(vwblInstance);
  };

  return {
    userAddress,
    web3,
    vwbl, // この１行を追加
    connectWallet,
    disconnectWallet,
    initVwbl,
  };
};

export const VwblContainer = createContainer(useVWBL);
