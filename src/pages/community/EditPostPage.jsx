import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CategoryHeader from '../../components/CategoryHeader';
import './EditPostPage.css';
import PostPictureUpload from '../../components/PostPictureUpload';
import postCategory from '../../const/postCategory';
import updatePost from '../../apis/api/updatePost'; // TODO: 수정하기
import fetchPostDetails from '../../apis/api/fetchPostDetails';
import renewRefreshToken from '../../apis/api/renewRefreshToken';
import deletePost from '../../apis/api/deletePost';
import { ExpiredAccessTokenError, NotValidAccessTokenError } from '../../apis/utility/errors';

const EditPostPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [postId, setPostId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(undefined);
  const [images, setImages] = useState([]);
  const [isModified, setIsModified] = useState(false);

  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`; // 내용에 맞게 높이 조절
    }
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`; // 내용에 맞게 높이 조절
    }
  }, [title, content]);

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (e) => setContent(e.target.value);

  useEffect(() => {
    loadPostDetails();
  }, []);

  const loadPostDetails = async () => {
    try {
      const fetchedPostDetails = await fetchPostDetails(params.id);
      setTitle(fetchedPostDetails.title);
      setContent(fetchedPostDetails.content);
      setSelectedCategory(postCategory[fetchedPostDetails.categoryCode]);
      setPostId(fetchedPostDetails.id);
    } catch (error) {
      if (error instanceof ExpiredAccessTokenError) {
        try {
          await renewRefreshToken();
          loadPostDetails();
        } catch (error) {
          navigate('/');
        }
      } else if (error instanceof NotValidAccessTokenError) navigate('/');
    }
  };

  const editPostHandler = async () => {
    if (!title) {
      toast.warn('제목을 입력하세요');
      return;
    }
    if (!content) {
      toast.warn('내용을 입력하세요');
      return;
    }
    if (title.length < 2) {
      toast.warn('제목은 최소 2글자 이상어야 합니다');
      return;
    }
    if (content.length < 2) {
      toast.warn('내용은 최소 2글자 이상어야 합니다');
      return;
    }
    if (!selectedCategory) {
      toast.warn('카테고리를 선택하세요');
      return;
    }

    try {
      await updatePost(
        {
          postId,
          title,
          content,
          categoryCode: Object.keys(postCategory).find(
            (key) => postCategory[key] === selectedCategory,
          ),
        },
        images,
      );
      toast.info('게시물이 작성되었습니다!', { position: 'bottom-center' });
      navigate(-1);
    } catch (error) {
      if (error instanceof ExpiredAccessTokenError) {
        try {
          await renewRefreshToken();
          editPostHandler();
        } catch (error) {
          navigate('/');
        }
      } else if (error instanceof NotValidAccessTokenError) navigate('/');
    }
  };

  const deletePostHandler = async () => {
    await deletePost(params.id);
    navigate('/home/community');
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  return (
    <>
      <CategoryHeader
        rightTextColor={isModified ? '' : 'red'}
        rightText={isModified ? '수정' : '삭제'}
        onClickLeft={() => navigate(-1)}
        onClickRight={() => {
          if (isModified) {
            editPostHandler();
          } else deletePostHandler();
        }}
        initSelected={selectedCategory}
        onSelected={(category) => {
          setSelectedCategory(category);
          setIsModified(true);
        }}
      />
      <div className="edit-post-page">
        <textarea
          placeholder="제목을 입력하세요"
          value={title}
          onChange={handleTitleChange}
          className="title-input"
          ref={titleRef}
          rows="1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // 줄바꿈 막음
            }
          }}
          onInput={() => setIsModified(true)}
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={handleContentChange}
          className="content-textarea"
          ref={contentRef}
          onInput={() => setIsModified(true)}
        />

        <PostPictureUpload onImagesChange={handleImagesChange} />
      </div>
    </>
  );
};

export default EditPostPage;
