import { ContractFactory, ethers } from "ethers"
import * as fs from "fs-extra"
import "dotenv/config"

async function main() {
    let provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    console.log(process.env.RPC_URL)
    console.log(process.env.PRIVATE_KEY)
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
    const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")
    const binary = fs.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.bin",
        "utf8",
    )
    const contractFactory = new ethers.ContractFactory(abi, binary, wallet)
    console.log(`Deploying from: ${wallet.address}`)
    const contractDeploy = await contractFactory.deploy()
    const txReceipt = await contractDeploy.deploymentTransaction()!.wait()
    const contractAddress = txReceipt!.contractAddress
    console.log(`Contract deployed to ${contractAddress}`)

    //interact with the contract
    const contract = new ethers.Contract(contractAddress!, abi, wallet)
    const updateValue = await contract.store(13)
    await updateValue.wait()
    console.log("Tx successful with hash " + updateValue.hash)

    const data = await contract.retrieve()
    console.log(`Data stored in contract: ${data}`)

    await contract.addPerson("Fabio", 26)
    console.log(
        "Person added has number: " +
            (await contract.nameToFavoriteNumber("Fabio")),
    )
    console.log(await contract.people(0))
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
