import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {clusterApiUrl,Connection,LAMPORTS_PER_SOL, TransactionSignature, PublicKey,Keypair } from '@solana/web3.js';
import { FC, useCallback,useState,useEffect} from 'react';
import { notify } from "../utils/notifications";
import QRCode from "react-qr-code";
import BigNumber from 'bignumber.js';
import { encodeURL, createQR, findReference, FindReferenceError, validateTransfer } from '@solana/pay';

async function validatePayment(reference,paymentStatus,recipient,amount){

    const connection = new Connection(
        clusterApiUrl('mainnet-beta'),
        'confirmed',
      );
      
    console.log('5. Find the transaction');
    console.log("INFO coming in: "+connection+" "+reference+" "+paymentStatus+" "+recipient+" "+amount);
    let signatureInfo;
   
    const { signature } = await new Promise((resolve, reject) => {
        /**
         * Retry until we find the transaction
         *
         * If a transaction with the given reference can't be found, the `findTransactionSignature`
         * function will throw an error. There are a few reasons why this could be a false negative:
         *
         * - Transaction is not yet confirmed
         * - Customer is yet to approve/complete the transaction
         *
         * You can implement a polling strategy to query for the transaction periodically.
         */
        const interval = setInterval(async () => {
            console.count('Checking for transaction...'+reference);
            try {
                signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
                console.log('\n 🖌  Signature found: ', signatureInfo.signature);
                clearInterval(interval);
                resolve(signatureInfo);
            } catch (error: any) {
                if (!(error instanceof FindReferenceError)) {
                    console.error(error);
                    clearInterval(interval);
                    reject(error);
                }
            }
        }, 250);
    });
    

    // Update payment status
    paymentStatus = 'confirmed';

    /**
     * Validate transaction
     *
     * Once the `findTransactionSignature` function returns a signature,
     * it confirms that a transaction with reference to this order has been recorded on-chain.
     *
     * `validateTransactionSignature` allows you to validate that the transaction signature
     * found matches the transaction that you expected.
     */
    console.log('\n6. 🔗 Validate transaction \n');

    try {
        await validateTransfer(connection, signature, { recipient: recipient, amount });

        // Update payment status
        paymentStatus = 'validated';
        console.log('✅ Payment validated');
        return true;
        
    } catch (error) {
        console.error('❌ Payment failed', error);
        return false;
    }
    }



export const GenerateSolPay: FC = () => {
    const connection = new Connection(
        clusterApiUrl('mainnet-beta'),
        'confirmed',
      );
    //const { publicKey } = useWallet();
    //const [amount1, setValue] = useState("0.1");
    let paymentStatus: string;
    
    //Standard vars
        const wallet=useWallet();
        const recipient = wallet.publicKey
        //let amount = new BigNumber(0.1);
        
        const [reference,setReference] = useState(new Keypair().publicKey);
        console.log("GENERATING NEW KEYPAIR:"+reference);
        const label = 'SolMerchant Transaction';
        const message = 'Payment to SolMerchant';
        const memo = 'SM';
        const [amount,setAmount]=useState(BigNumber(0.1));
        const [url, setURL] = useState(encodeURL({ recipient, amount, reference, label, message, memo }));
        const [checkMark,setCheckMark]=useState();
        const [isDone,setIsDone]=useState(false)
        const [solPayPicked,setSPP]=useState(false);

        // const changeURL = (inURL) => {
        //     setURL(inURL);
        //   };
    async function generateQR(){
        setIsDone(false);
        setSPP(true);
        //const qrValue="solana:"+publicKey+"?amount="+amount1+"&&label=SnapSol+Payment"
        console.log('2. 🛍 Simulate a customer checkout \n');
        setReference(new Keypair().publicKey);
        console.log("GENERATING NEW KEYPAIR INSIDE :"+reference);
        setURL(encodeURL({ recipient, amount, reference, label, message, memo }));
        paymentStatus = 'pending';
        console.log("NEW URL: "+url);
        console.log("BEFORE VALIDATE");
        setIsDone(await validatePayment(reference,paymentStatus,recipient,amount));
        console.log("CALLED VALIDATE");
        if(isDone){
           console.log("DONE MF");
        }
        setSPP(false);
    }
    
    async function mintReceipt(){

    }
    
    
    

    return (
        
        <div> 
        <div className=" flex flex-col space-y-4">
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
                onClick={() => {generateQR()}}  
                disabled={!wallet}
                >Generate QR  
            </button>  
            </div>
            <div>
                {solPayPicked
                ? <QRCode
                className="py-5"
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={url+""}
                viewBox={`0 0 256 256`}
                    />
                :<p></p>
                }
           
            </div>
            <div>
                {isDone 
                ?<div>
                    <img style={{ height: "auto", maxWidth: "250px", width: "250px", marginLeft:"auto",marginRight:"auto"}} src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Eo_circle_green_checkmark.svg/512px-Eo_circle_green_checkmark.svg.png?20200417132424"/>
                    <button  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {mintReceipt()}}  
                    disabled={!wallet}>
                        Mint receipt</button>
                </div>
                :<p></p>
                
                }
            </div>
            
         </div>
    );
};