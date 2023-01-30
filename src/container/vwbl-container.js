import { createContainer } from 'unstated-next';
import { useState } from 'react';
import { ethers, utils } from 'ethers';
import { ManageKeyType, UploadContentType, UploadMetadataType, VWBLEthers } from 'vwbl-sdk';

const useVWBL = () => {
  const [userAddress, setUserAddress] = useState('');
  const [ethersProvider, setEthersProvider] = useState();
  /* useVWBLの持つ変数にvwblインスタンスを追加 */
  const [vwbl, setVwbl] = useState();

  const connectWallet = async () => {
    try {
      // メタマスクがインストールされているか確認
      const { ethereum } = window;
      if (!ethereum) {
        throw new Error('Please install MetaMask!');
      } else {
        console.log('MetaMask is installed!', ethereum);
      }

      // ウォレット接続して、userAddressとethersProviderのstateを保存
      await ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      setEthersProvider(provider);
      setUserAddress(account);

      // 接続しているチェーンがMumbaiでない場合は、チェーンの変更をrequest
      const { chainId } = await provider.getNetwork();
      const properChainId = parseInt(process.env.REACT_APP_CHAIN_ID);
      if (chainId !== properChainId) {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: utils.hexValue(utils.hexlify(properChainId)) }],
        });
      }

      /* vwblインスタンス作成してstateを保存する処理 */
      initVwbl(provider, signer);
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
    setEthersProvider(undefined);
    setVwbl(undefined);
  };

  const initVwbl = (ethersProvider, ethersSigner) => {
    // vwblインスタンスの作成
    const vwblInstance = new VWBLEthers({
      ethersProvider,
      ethersSigner,
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
    ethersProvider,
    vwbl,
    connectWallet,
    disconnectWallet,
    initVwbl,
  };
};

export const VwblContainer = createContainer(useVWBL);
