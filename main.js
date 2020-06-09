const Web3 = require('web3');
const ABI = require('./ABI.json');

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/12658a3bd98b410483b8cd44328533d0'));

const address = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";

var crytpoKitties = new web3.eth.Contract(ABI, address);

(async () => {
    console.log('Retreiving logs from the Birth event ...');

    var logs = []

    //can't get all the events in 1 query : more than 10 000 results
    var startBlock = 6607985;
    var endBlock = 7028323;
    var inc = startBlock + 1000;
    while(inc < endBlock){
        let events = await crytpoKitties.getPastEvents('Birth', {
            fromBlock: startBlock,
            toBlock: inc
        });
        logs = logs.concat(events);
        startBlock += 1000;
        inc += 1000;
    }
    let events = await crytpoKitties.getPastEvents('Birth', {
        fromBlock: startBlock,
        toBlock: endBlock
    });
    logs = logs.concat(events);

    console.log('Parsing the logs...')
    var matrons = {};

    logs.forEach(log => {
        if(log.returnValues.matronId != 0){
            if(log.returnValues.matronId in matrons){
                matrons[log.returnValues.matronId]++;
            }
            else{
                matrons[log.returnValues.matronId] = 1;
            }
        }
    });


    var comparator = -1;
    var bigMomma;
    Object.keys(matrons).forEach( k => {
        if(matrons[k] > comparator){
            comparator = matrons[k];
            bigMomma = k;
        }
    });

    var bigMommaData = await crytpoKitties.methods.getKitty(bigMomma).call();

    console.log("\nFrom block 6607985 to block 7028323, the Big Momma Kitty is : "+bigMomma);
    console.log("She gave birth to "+ matrons[bigMomma]+ " kitties");
    console.log("She was born at "+bigMommaData.birthTime+" and is from the generation "+bigMommaData.generation);
    console.log('Her genes are : '+bigMommaData.genes);


})();