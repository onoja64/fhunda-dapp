import { CampaignDetailPage } from "@/components/campaigns/CampaignDetailPage";

interface CampaignDetailProps {
  params: { id: string };
}

export default function CampaignDetail({ params }: CampaignDetailProps): JSX.Element {
  return <CampaignDetailPage campaignId={params.id} />;
}
