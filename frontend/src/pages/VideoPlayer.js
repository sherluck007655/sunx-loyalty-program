import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Breadcrumb, Button } from 'react-bootstrap';
import { FaArrowLeft, FaClock, FaEye, FaThumbsUp, FaShare, FaDownload } from 'react-icons/fa';
import api from '../services/api';

const VideoPlayer = () => {
    const { videoId } = useParams();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [watchProgress, setWatchProgress] = useState(0);
    const playerRef = useRef(null);

    useEffect(() => {
        fetchVideo();
    }, [videoId]);

    useEffect(() => {
        if (video) {
            fetchRelatedVideos();
        }
    }, [video]);

    const fetchVideo = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/training/videos/${videoId}`);
            setVideo(response.data.data);
        } catch (err) {
            setError('Failed to load video');
            console.error('Error fetching video:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedVideos = async () => {
        try {
            const response = await api.get(`/training/categories/${video.categoryId._id}/videos`, {
                params: { limit: 6 }
            });
            // Filter out current video
            const related = response.data.data.videos.filter(v => v._id !== videoId);
            setRelatedVideos(related.slice(0, 4));
        } catch (err) {
            console.error('Error fetching related videos:', err);
        }
    };

    const recordProgress = async (duration, completed = false) => {
        try {
            await api.post(`/training/videos/${videoId}/progress`, {
                watchDuration: duration,
                completed
            });
        } catch (err) {
            console.error('Error recording progress:', err);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'success';
            case 'intermediate': return 'warning';
            case 'advanced': return 'danger';
            default: return 'secondary';
        }
    };

    const getEmbedUrl = (video) => {
        switch (video.videoType) {
            case 'youtube':
                return `https://www.youtube.com/embed/${video.videoId}?enablejsapi=1&origin=${window.location.origin}`;
            case 'facebook':
                return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.videoUrl)}&width=800&show_text=false&appId`;
            case 'vimeo':
                return `https://player.vimeo.com/video/${video.videoId}`;
            default:
                return video.videoUrl;
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: video.description,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading video...</p>
            </Container>
        );
    }

    if (error || !video) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error || 'Video not found'}</Alert>
                <Link to="/training" className="btn btn-primary">
                    <FaArrowLeft className="me-2" />
                    Back to Training
                </Link>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/training" }}>
                    Training
                </Breadcrumb.Item>
                <Breadcrumb.Item 
                    linkAs={Link} 
                    linkProps={{ to: `/training/category/${video.categoryId._id}` }}
                >
                    {video.categoryId.name}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    {video.title}
                </Breadcrumb.Item>
            </Breadcrumb>

            <Row>
                {/* Video Player */}
                <Col lg={8}>
                    <Card className="mb-4">
                        <div className="ratio ratio-16x9">
                            <iframe
                                ref={playerRef}
                                src={getEmbedUrl(video)}
                                title={video.title}
                                allowFullScreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                className="rounded-top"
                            />
                        </div>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h1 className="h3 mb-2">{video.title}</h1>
                                    <div className="d-flex gap-2 mb-2">
                                        <Badge bg={getDifficultyColor(video.difficulty)}>
                                            {video.difficulty}
                                        </Badge>
                                        <Badge bg="secondary">
                                            <FaClock className="me-1" />
                                            {formatDuration(video.duration)}
                                        </Badge>
                                        <Badge bg="info">
                                            <FaEye className="me-1" />
                                            {video.viewCount} views
                                        </Badge>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-primary" size="sm" onClick={handleShare}>
                                        <FaShare className="me-1" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                            
                            <p className="text-muted mb-3">{video.description}</p>
                            
                            {video.tags && video.tags.length > 0 && (
                                <div className="mb-3">
                                    <strong className="me-2">Tags:</strong>
                                    {video.tags.map((tag, index) => (
                                        <Badge key={index} bg="light" text="dark" className="me-1">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col lg={4}>
                    {/* Category Info */}
                    <Card className="mb-4">
                        <Card.Body className="text-center">
                            <i className={`${video.categoryId.icon} fa-2x text-primary mb-2`}></i>
                            <h5>{video.categoryId.name}</h5>
                            <p className="text-muted small mb-3">
                                {video.categoryId.description}
                            </p>
                            <Link
                                to={`/training/category/${video.categoryId._id}`}
                                className="btn btn-outline-primary btn-sm"
                            >
                                View All Videos
                            </Link>
                        </Card.Body>
                    </Card>

                    {/* Related Videos */}
                    {relatedVideos.length > 0 && (
                        <Card>
                            <Card.Header>
                                <h5 className="mb-0">Related Videos</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {relatedVideos.map((relatedVideo) => (
                                    <Link
                                        key={relatedVideo._id}
                                        to={`/training/video/${relatedVideo._id}`}
                                        className="text-decoration-none"
                                    >
                                        <div className="d-flex p-3 border-bottom hover-bg-light">
                                            <img
                                                src={relatedVideo.thumbnailUrl || '/images/video-placeholder.jpg'}
                                                alt={relatedVideo.title}
                                                className="rounded"
                                                style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                                            />
                                            <div className="ms-3 flex-grow-1">
                                                <h6 className="mb-1 text-dark">
                                                    {relatedVideo.title}
                                                </h6>
                                                <div className="d-flex gap-2">
                                                    <small className="text-muted">
                                                        <FaClock className="me-1" />
                                                        {formatDuration(relatedVideo.duration)}
                                                    </small>
                                                    <small className="text-muted">
                                                        <FaEye className="me-1" />
                                                        {relatedVideo.viewCount}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default VideoPlayer;
