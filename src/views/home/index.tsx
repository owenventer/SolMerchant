// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import { GenerateSolPay } from '../../components/generateSolPay';
//import { GenerateCrossMint } from '../../components/generateSolPay';
import pkg from '../../../package.json';


// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  console.log(wallet);
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          SolMerchant <span className='text-sm font-normal align-top text-slate-700'></span>
        </h1>
        <h4 className="md:w-full text-center text-slate-300 my-2">
          <p>The on the go Solana based Point of Sale System</p>
          
        </h4>
        {/* <div className="max-w-md mx-auto mockup-code bg-primary p-6 my-2">
          <pre data-prefix=">">
            <code className="truncate">Start building on Solana  </code>
          </pre>
        </div>         */}
        
          <div className="text-center">
          <GenerateSolPay/>
          
          

          
          {/* {wallet && <p>SOL Bal: {(balance || 0).toLocaleString()}</p>} */}
        </div>
      </div>
    </div>
  );
};
