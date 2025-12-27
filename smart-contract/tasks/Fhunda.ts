import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("fhunda:create-campaign", "Create a new Fhunda campaign")
  .addParam("target", "Target amount in ETH")
  .addParam("duration", "Campaign duration in days")
  .addParam("title", "Campaign title")
  .addParam("description", "Campaign description")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const fhunda = await hre.ethers.getContractAt("Fhunda", process.env.FHUNDA_ADDRESS || "", signer);

    const targetAmount = hre.ethers.parseEther(taskArgs.target);
    const duration = parseInt(taskArgs.duration);
    const title = taskArgs.title;
    const description = taskArgs.description;

    console.log("Creating campaign with:");
    console.log(`  Target: ${taskArgs.target} ETH`);
    console.log(`  Duration: ${duration} days`);
    console.log(`  Title: ${title}`);
    console.log(`  Description: ${description}`);

    const tx = await fhunda.createCampaign(targetAmount, duration, title, description);

    const receipt = await tx.wait();
    console.log(`Campaign created! Transaction: ${receipt?.transactionHash}`);

    const campaignId = await fhunda.getCampaignCounter();
    console.log(`Campaign ID: ${(campaignId - 1n).toString()}`);
  });

task("fhunda:get-campaign", "Get campaign details")
  .addParam("id", "Campaign ID")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const fhunda = await hre.ethers.getContractAt("Fhunda", process.env.FHUNDA_ADDRESS || "", signer);

    const campaign = await fhunda.getCampaign(taskArgs.id);
    const status = await fhunda.getCampaignStatus(taskArgs.id);
    const totalFunded = await fhunda.getTotalFunded(taskArgs.id);

    console.log(`\n=== Campaign #${taskArgs.id} ===`);
    console.log(`Title: ${campaign.title}`);
    console.log(`Description: ${campaign.description}`);
    console.log(`Creator: ${campaign.creator}`);
    console.log(`Target: ${hre.ethers.formatEther(campaign.targetAmount)} ETH`);
    console.log(`Total Funded: ${hre.ethers.formatEther(totalFunded)} ETH`);
    console.log(`Deadline: ${new Date(Number(campaign.deadline) * 1000).toLocaleString()}`);
    console.log(`Status: ${status}`);
    console.log(`Active: ${campaign.active}`);
    console.log(`Withdrawn: ${campaign.withdrawn}`);
  });

task("fhunda:list-campaigns", "List all campaigns").setAction(async (taskArgs: TaskArguments, hre) => {
  const [signer] = await hre.ethers.getSigners();

  const fhunda = await hre.ethers.getContractAt("Fhunda", process.env.FHUNDA_ADDRESS || "", signer);

  const count = await fhunda.getCampaignCounter();
  console.log(`\n=== Total Campaigns: ${count.toString()} ===\n`);

  for (let i = 0; i < Number(count); i++) {
    const campaign = await fhunda.getCampaign(i);
    const status = await fhunda.getCampaignStatus(i);
    const totalFunded = await fhunda.getTotalFunded(i);

    console.log(`Campaign #${i}`);
    console.log(`  Title: ${campaign.title}`);
    console.log(`  Status: ${status}`);
    console.log(`  Target: ${hre.ethers.formatEther(campaign.targetAmount)} ETH`);
    console.log(`  Funded: ${hre.ethers.formatEther(totalFunded)} ETH`);
    console.log("");
  }
});

task("fhunda:contribute", "Contribute to a campaign")
  .addParam("id", "Campaign ID")
  .addParam("amount", "Contribution amount in ETH")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const fhunda = await hre.ethers.getContractAt("Fhunda", process.env.FHUNDA_ADDRESS || "", signer);

    const amount = hre.ethers.parseEther(taskArgs.amount);

    console.log(`Contributing ${taskArgs.amount} ETH to campaign #${taskArgs.id}...`);

    const tx = await fhunda.contribute(taskArgs.id, "0x", { value: amount });
    const receipt = await tx.wait();

    console.log(`Contribution successful! Transaction: ${receipt?.transactionHash}`);
  });

task("fhunda:withdraw", "Withdraw funds from a campaign")
  .addParam("id", "Campaign ID")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const fhunda = await hre.ethers.getContractAt("Fhunda", process.env.FHUNDA_ADDRESS || "", signer);

    console.log(`Withdrawing funds from campaign #${taskArgs.id}...`);

    const tx = await fhunda.withdrawFunds(taskArgs.id);
    const receipt = await tx.wait();

    console.log(`Withdrawal successful! Transaction: ${receipt?.transactionHash}`);
  });

task("fhunda:refund", "Request refund from a campaign")
  .addParam("id", "Campaign ID")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const fhunda = await hre.ethers.getContractAt("Fhunda", process.env.FHUNDA_ADDRESS || "", signer);

    console.log(`Requesting refund from campaign #${taskArgs.id}...`);

    const tx = await fhunda.refund(taskArgs.id);
    const receipt = await tx.wait();

    console.log(`Refund successful! Transaction: ${receipt?.transactionHash}`);
  });

task("fhunda:close", "Close a campaign")
  .addParam("id", "Campaign ID")
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const [signer] = await hre.ethers.getSigners();

    const fhunda = await hre.ethers.getContractAt("Fhunda", process.env.FHUNDA_ADDRESS || "", signer);

    console.log(`Closing campaign #${taskArgs.id}...`);

    const tx = await fhunda.closeCampaign(taskArgs.id);
    const receipt = await tx.wait();

    console.log(`Campaign closed! Transaction: ${receipt?.transactionHash}`);
  });
