import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {clusterApiUrl,Connection,LAMPORTS_PER_SOL, TransactionSignature, PublicKey,Keypair } from '@solana/web3.js';
import { FC, useCallback,useState,useEffect} from 'react';
import { notify } from "../utils/notifications";
import QRCode from "react-qr-code";
import BigNumber from 'bignumber.js';
import { encodeURL, createQR, findReference, FindReferenceError, validateTransfer } from '@solana/pay';

async function validatePayment(reference,paymentStatus,recipient,amount,url){

    const connection = new Connection(
        //clusterApiUrl('mainnet-beta'),
        process.env.NEXT_PUBLIC_RPC,
        'confirmed',
      );
      
    console.log('5. Find the transaction');
    //console.log("INFO coming in: "+connection+" "+reference+" "+paymentStatus+" "+recipient+" "+amount);
    console.log("URL coming in: "+url);
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
                console.log('\n 🖌  Signature found: ', signatureInfo.signature,signatureInfo);
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
        //clusterApiUrl('mainnet-beta'),
        process.env.NEXT_PUBLIC_RPC,
        'confirmed',
      );
    //const { publicKey } = useWallet();
    //const [amount1, setValue] = useState("0.1");
    let paymentStatus: string;
    
    //Standard vars
        const wallet=useWallet();
        const recipient =new PublicKey("9AihNo84zvCbJNPH6aceCa3SuGDCJZrRuJ3XR1SypZ5n");
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
        const [mintReceiptClicked,setMintReceiptClicked]=useState(false);


        // const changeURL = (inURL) => {
        //     setURL(inURL);
        //   };
    async function generateQR(){
        setMintReceiptClicked(false);
        setIsDone(false);
        setSPP(true);
        const recipient =wallet.publicKey;
        //const qrValue="solana:"+publicKey+"?amount="+amount1+"&&label=SnapSol+Payment"
        console.log('2. 🛍 Simulate a customer checkout \n');
        setReference(new Keypair().publicKey);
        console.log("GENERATING NEW KEYPAIR INSIDE :"+reference);
        setURL(encodeURL({ recipient, amount, reference, label, message, memo }));
        paymentStatus = 'pending';
        console.log("NEW URL: "+url);
        console.log("BEFORE VALIDATE");
        setIsDone(await validatePayment(reference,paymentStatus,recipient,amount,url));
        console.log("CALLED VALIDATE");
        if(isDone){
           console.log("DONE MF");
        }
        setSPP(false);
    }
    
    async function mintReceipt(){
            setMintReceiptClicked(true);
            //DATE INFO 
            
                var date = new Date().getDate(); //Current Date
                var month = new Date().getMonth() + 1; //Current Month
                var year = new Date().getFullYear(); //Current Year
                var hours = new Date().getHours(); //Current Hours
                var min = new Date().getMinutes(); //Current Minutes
                


            //MINT INFO
            const reqHeader = new Headers();
            reqHeader.append("x-client-secret", process.env.NEXT_PUBLIC_CMCSK);
            reqHeader.append("x-project-id", process.env.NEXT_PUBLIC_CMPID);
            reqHeader.append("Content-Type", "application/json");

            const collectionName = "default-solana" // change if you've created a collection
            const recipient = "solana:"+ wallet.publicKey;
            // Or with just an email:
            // const recipient = "email:peter@crossmint.com:polygon"

            const reqBody = JSON.stringify({
            "metadata": {
                "name": 'SolMerchant Receipt',
                "image":"https://shdw-drive.genesysgo.net/3z41NCLcgmQzRaCPc5TpyJcDUgetmStXHfgBVpefRr4Z/receiptSM.png",
                "description": 'This NFT is a receipt of a transaction on SolMerchant',
                "attributes": [
                    {"trait_type": "Sender", value:"TBD"},
                    {"trait_type": "Receiver", value:""+wallet.publicKey},
                    {"trait_type": "Amount", value:""+amount},
                    {"trait_type": "Token Type", value:"SOL"},
                    {"trait_type": "Date", value:date + "/" + month + "/" + year 
                    + " " + hours + ":" + min}
                  ],
            },
            "recipient": recipient
            });

            var requestOptions = {
            method: 'POST',
            headers: reqHeader,
            body: reqBody,
            //redirect: 'follow'
            };

            fetch(`https://www.crossmint.com/api/2022-06-09/collections/${collectionName}/nfts`, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));

            console.log("hopefully succesfully minted an nft");
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
                    {mintReceiptClicked
                    ?<h4 className="md:w-full text-center text-slate-300 my-2">
                    <p>Minted NFT Receipt! Check your wallet.</p>
                  </h4>
                    :<p></p>
                    }
                </div>
                :<p></p>
                
                }
            </div>
            
         </div>
    );
};