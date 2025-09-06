export interface HistoryPage {
  metadata: {
    title: string;
    description: string;
    keywords: string;
  };
  title: string;
  description: string;
  status: {
    completed: string;
    failed: string;
    processing: string;
    pending: string;
  };
  credits_used: string;
  credits_refunded: string;
  images: string;
  view: string;
  download: string;
  download_success: string;
  delete_success: string;
  delete_error: string;
  load_more: string;
  loading: string;
  load_more_error: string;
  no_more: string;
  image_preview: string;
  error: {
    unknown: string;
  };
  empty: {
    title: string;
    description: string;
    action: string;
  };
  delete_confirm: {
    title: string;
    description: string;
    cancel: string;
    confirm: string;
  };
}