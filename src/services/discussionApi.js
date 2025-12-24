// src/services/discussionApi.js
import api from "./api"; // your axios instance

export const getAllDiscussions = (query = "") => api.get(`/discussions${query}`);
export const createDiscussion = (formData) =>
  api.post("/discussions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getDiscussionById = (id) => api.get(`/discussions/${id}`);

// addReplyToDiscussion supports files: expects FormData (text, parentId, attachments[])
export const addReplyToDiscussion = (id, formData) =>
  api.post(`/discussions/${id}/comment`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const toggleLikeOnComment = (postId, commentId) =>
  api.post(`/discussions/${postId}/comment/${commentId}/like`);

export const toggleSolutionOnComment = (postId, commentId) =>
  api.post(`/discussions/${postId}/comment/${commentId}/solution`);

// optional upload helper
export const uploadFile = (formData) =>
  api.post("/discussions/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
