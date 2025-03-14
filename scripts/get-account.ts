import { ArgumentParser } from "argparse";
import { defaultToEnv } from "./lib/argparse";
import { getConfigDataForPrivateKey as getConfigDataForSecp256k1PrivateKey } from "../src/wallets/base-wallet/signers/secp256k1/config-data";
import { getConfigDataForPrivateKey as getConfigDataForWebAuthnPrivateKey } from "../src/wallets/base-wallet/signers/webauthn/config-data";
import { client } from "./lib/client";
import { getAddress } from "../src/wallets/base-wallet/user-op";
import { CoinbaseSmartWalletConfigData, encodeConfigData } from "../src/wallets/base-wallet/config";
const P256 = require("ecdsa-secp256r1");

async function main() {
  const parser = new ArgumentParser({
    description: "Get the keyspace key and account address for a given private key",
  });

  parser.add_argument("--private-key", {
    help: "The current private key of the owner",
    ...defaultToEnv("PRIVATE_KEY"),
  });
  parser.add_argument("--signature-type", {
    help: "The type of signature for the Keyspace key",
    default: "secp256k1",
  });

  const args = parser.parse_args();
  let configData: CoinbaseSmartWalletConfigData;
  if (args.signature_type === "secp256k1") {
    configData = getConfigDataForSecp256k1PrivateKey(args.private_key);
  } else if (args.signature_type === "webauthn") {
    const privateKey = P256.fromJWK(JSON.parse(args.private_key));
    configData = getConfigDataForWebAuthnPrivateKey(privateKey);
  } else {
    console.error("Invalid circuit type");
    return;
  }

  console.log("Initial config data:", encodeConfigData(configData));
  console.log("Account address:", await getAddress(client, {
    initialConfigData: encodeConfigData(configData),
    nonce: 0n,
  }));
}

if (import.meta.main) {
  main();
}
