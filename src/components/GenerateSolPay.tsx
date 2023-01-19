import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, TransactionSignature,Keypair } from '@solana/web3.js';
import { FC, useCallback,useState} from 'react';
import { notify } from "../utils/notifications";
import QRCode from "react-qr-code";
import { Cluster, clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { encodeURL, createQR } from '@solana/pay';
import BigNumber from 'bignumber.js';

export const GenerateSolPay: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();


    function setValue(num){
        amount=new BigNumber(num)
    }
    //SolanaPay consts
    console.log('2. 🛍 Simulate a customer checkout \n');
    let recipient = new PublicKey('MERCHANT_WALLET');
    let amount= new BigNumber(20);
    const reference = new Keypair().publicKey;
    const label = 'SolMerchant';
    const message = 'Pay the ammount owed';
    const memo = 'JC#4098';

    //SolanaPay url
    console.log('3. 💰 Create a payment request link \n');
    const url = encodeURL({ recipient, amount, reference, label, message, memo });

    //SolanaPay qrCode
    const qrCode = createQR(url);
    const element = document.getElementById('qr-code');
    // append QR code to the element
    qrCode.append(element);


    return (
        <div>
            <label className="text-center text-1xl font-bold">Enter Amount:</label>
            <br/>
            
            <input className="text-center text-1xl md:pl-15 font-bold text-black py-2"
          type="number"
          onChange={(e) => setValue(e.target.value)}
          placeholder="Amount to pay"/>
            <br/>
            <QRCode
                className="py-5"
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={""+url}
                viewBox={`0 0 256 256`}
            />
            
        </div>
    );
};