import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, TransactionSignature, PublicKey,Keypair } from '@solana/web3.js';
import { FC, useCallback,useState} from 'react';
import { notify } from "../utils/notifications";
import QRCode from "react-qr-code";
import BigNumber from 'bignumber.js';
import { encodeURL, createQR } from '@solana/pay';

export const GenerateSolPay: FC = () => {
    const { connection } = useConnection();
    //const { publicKey } = useWallet();
    //const [amount1, setValue] = useState("0.1");

    //Standard vars
        const recipient = new PublicKey("9AihNo84zvCbJNPH6aceCa3SuGDCJZrRuJ3XR1SypZ5n");
        //let amount = new BigNumber(0.1);
        let reference = new Keypair().publicKey;
        const label = 'SolMerchant Transaction';
        const message = 'Payment to SolMerchant';
        const memo = 'SM';
        const [amount,setAmount]=useState(BigNumber(0.1));
        const [url, setURL] = useState(encodeURL({ recipient, amount, reference, label, message, memo }));
        

        // const changeURL = (inURL) => {
        //     setURL(inURL);
        //   };
    function generateQR(num){

        //const qrValue="solana:"+publicKey+"?amount="+amount1+"&&label=SnapSol+Payment"
        console.log('2. 🛍 Simulate a customer checkout \n');
        reference = new Keypair().publicKey;
        setAmount(new BigNumber(num));
        setURL(encodeURL({ recipient, amount, reference, label, message, memo }));
        console.log("NEW URL: "+url);
}
    
    return (
        <div> 
        <div className="flex flex-col space-y-4">
            <div>
            <label className="text-center text-1xl font-bold">Enter Amount:</label>
            <br/>
            
            <input className="text-center text-1xl md:pl-15 font-bold text-black py-2"
          type="number"
          onChange={(e) => setAmount(new BigNumber(e.target.value))}
          placeholder="Amount to pay"/>
          </div>
            <br/>
            <button  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => { setURL(encodeURL({ recipient, amount, reference, label, message, memo })); }}  
                >Generate QR  
            </button>  
            </div>
            <div>
            <QRCode
                className="py-5"
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={url+""}
                viewBox={`0 0 256 256`}
            />
            </div>
         </div>
    );
};