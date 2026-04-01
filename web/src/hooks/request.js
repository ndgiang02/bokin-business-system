// hooks/useRequest.js
import { requestStore } from '../stores/requestStore';

export const request = () => {
  const { requests, createRequest, isLoading } = requestStore();

  return {requests,createRequest,isLoading};
};