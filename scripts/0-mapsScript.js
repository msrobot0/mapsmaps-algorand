const { executeTransaction, balanceOf } = require('@algo-builder/algob');

// a helper function used to create fund transaction
function mkParam(senderAccount, receiverAddr, amount, payFlags) {
  return {
    type: TransactionType.TransferAlgo,
    sign: SignType.SecretKey,
    fromAccount: senderAccount,
    toAccountAddr: receiverAddr,
    amountMicroAlgos: amount,
    payFlags: payFlags
  };
};


// This is an entry function in our script (a default, exported function)
async function run (runtimeEnv, deployer) {
  console.log('[gold]: Script has started execution!');

  // we start with extracting acocunt objects from the config.
  const masterAccount = deployer.accountsByName.get('master-account');
  const goldOwner = deployer.accountsByName.get('alice');
  const john = deployer.accountsByName.get('john');
  

  // Accounts can only be active if they poses minimum amont of ALGOs.
  // Here we fund the accounts with 5e6, 5e6 and 1e6 AlGOs.
  const message = 'funding account';
  const promises = [
    executeTransaction(deployer, mkParam(masterAccount, goldOwner.addr, 5e6, { note: message })),
    executeTransaction(deployer, mkParam(masterAccount, john.addr, 5e6, { note: message }))];
  await Promise.all(promises);


  // Let's deploy ASA. The following commnad will open the `assets/asa.yaml` file and search for
  // the `gold` ASA. The transaction can specify standard transaction parameters. If skipped
  // node suggested values will be used.
  const asaInfo = await deployer.deployASA('mapsASA', {
    creator: goldOwner
    // totalFee: 1001,
    // feePerByte: 100,
    // firstValid: 10,
    // validRounds: 1002
  });
  console.log(asaInfo);

  // In asa.yaml we only added `john` to opt-in accounts. Let's add `bob` as well using the
  // script;

  // to interact with an asset we need asset ID. We can get it from the returned object:
  const assetID = asaInfo.assetIndex;

  // we can inspect the balance of the goldOnwer. It should equal to the `total` value defined
  // in the asa.yaml.
  await balanceOf(deployer, goldOwner.addr, assetID);

  console.log('[gold]: Script execution has finished!');
}

module.exports = { default: run };