"""
Community Build Gallery API
Browse designs others have actually built with photos, costs, and lessons learned
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

router = APIRouter()

# In-memory storage for gallery
gallery_posts: Dict[str, Dict] = {}
comments_db: Dict[str, List[Dict]] = {}
likes_db: Dict[str, List[str]] = {}

class GalleryPost(BaseModel):
    id: str
    title: str
    description: str
    author: str
    author_id: str
    project_type: str
    style: str
    dimensions: Dict[str, float]
    materials: List[str]
    hardware: List[str]
    images: List[str]
    cost_breakdown: Dict[str, float]
    time_hours: float
    difficulty: str
    lessons_learned: List[str]
    tips: List[str]
    likes: int
    comments: int
    featured: bool
    created_at: str

class Comment(BaseModel):
    post_id: str
    author: str
    author_id: str
    content: str

class NewPost(BaseModel):
    title: str
    description: str
    author: str
    author_id: str
    project_type: str
    style: str
    width: float
    height: float
    depth: float
    materials: List[str]
    hardware: List[str]
    cost_materials: float = 0
    cost_hardware: float = 0
    cost_total: float = 0
    time_hours: float = 0
    difficulty: str = "intermediate"
    lessons_learned: List[str] = []
    tips: List[str] = []

# Sample gallery posts for demo
SAMPLE_POSTS = [
    {
        "id": "post_001",
        "title": "Modern Shaker Kitchen Cabinets",
        "description": "Complete kitchen remodel with 15 base cabinets and 12 wall cabinets. Shaker style with soft-close everything.",
        "author": "Mike W.",
        "author_id": "user_001",
        "project_type": "kitchen",
        "style": "shaker",
        "dimensions": {"width": 240, "height": 42, "depth": 24},
        "materials": ["3/4\" Birch Plywood", "1/4\" Plywood Backs", "Edge Banding"],
        "hardware": ["Blum Soft-Close Hinges", "Blum Tandem Slides", "Hafele Pulls"],
        "images": ["/gallery/kitchen1.jpg", "/gallery/kitchen2.jpg"],
        "cost_breakdown": {"materials": 2400, "hardware": 890, "finish": 180, "total": 3470},
        "time_hours": 120,
        "difficulty": "advanced",
        "lessons_learned": [
            "Pre-finish components before assembly to save time",
            "Label every piece during dry-fit",
            "Invest in quality drawer slides - worth every penny"
        ],
        "tips": [
            "Use a story pole for consistent measurements",
            "Build a test cabinet first to work out the kinks",
            "Order 10% extra material for mistakes"
        ],
        "likes": 245,
        "comments": 32,
        "featured": True,
        "created_at": "2024-01-15T10:00:00"
    },
    {
        "id": "post_002",
        "title": "Floating Bathroom Vanity",
        "description": "36\" floating vanity with two drawers and open shelf. Walnut veneer with brushed nickel hardware.",
        "author": "Sarah K.",
        "author_id": "user_002",
        "project_type": "vanity",
        "style": "modern",
        "dimensions": {"width": 36, "height": 22, "depth": 20},
        "materials": ["3/4\" Walnut Plywood", "Walnut Edge Banding", "Solid Walnut Drawer Fronts"],
        "hardware": ["Soft-Close Under-mount Slides", "Brushed Nickel Pulls"],
        "images": ["/gallery/vanity1.jpg", "/gallery/vanity2.jpg"],
        "cost_breakdown": {"materials": 380, "hardware": 95, "finish": 45, "total": 520},
        "time_hours": 18,
        "difficulty": "intermediate",
        "lessons_learned": [
            "Floating cabinets need serious wall anchoring",
            "Measure plumbing locations 3 times before cutting",
            "Pre-drill everything in hardwood"
        ],
        "tips": [
            "Use a French cleat for easy mounting",
            "Apply finish before attaching hardware",
            "Leave extra room for drawer slides"
        ],
        "likes": 189,
        "comments": 24,
        "featured": True,
        "created_at": "2024-02-20T14:30:00"
    },
    {
        "id": "post_003",
        "title": "Garage Storage System",
        "description": "Floor-to-ceiling storage cabinets for the garage. 4 base cabinets with workbench and 6 wall cabinets.",
        "author": "John D.",
        "author_id": "user_003",
        "project_type": "garage",
        "style": "utilitarian",
        "dimensions": {"width": 144, "height": 84, "depth": 24},
        "materials": ["3/4\" BC Plywood", "1/4\" Plywood Backs", "Melamine Shelves"],
        "hardware": ["Heavy-Duty Slides", "Utility Handles", "Leveler Feet"],
        "images": ["/gallery/garage1.jpg"],
        "cost_breakdown": {"materials": 680, "hardware": 220, "total": 900},
        "time_hours": 45,
        "difficulty": "beginner",
        "lessons_learned": [
            "Melamine is easy to work with but chips easily",
            "Level the floor first or use adjustable feet",
            "Keep doors simple for faster build"
        ],
        "tips": [
            "Use confirmat screws for melamine",
            "Add french cleat for wall mounting",
            "Build cabinets in sections for easier installation"
        ],
        "likes": 156,
        "comments": 18,
        "featured": False,
        "created_at": "2024-03-10T09:15:00"
    },
    {
        "id": "post_004",
        "title": "Built-In Bookshelves",
        "description": "Wall-to-wall built-in bookshelves with window seat. Painted white with crown molding.",
        "author": "Emily R.",
        "author_id": "user_004",
        "project_type": "bookshelf",
        "style": "traditional",
        "dimensions": {"width": 180, "height": 96, "depth": 12},
        "materials": ["3/4\" MDF", "Poplar Trim", "Birch Plywood Seat"],
        "hardware": ["Shelf Pins", "Crown Molding", "Baseboard"],
        "images": ["/gallery/bookshelf1.jpg", "/gallery/bookshelf2.jpg"],
        "cost_breakdown": {"materials": 520, "hardware": 85, "paint": 75, "total": 680},
        "time_hours": 35,
        "difficulty": "intermediate",
        "lessons_learned": [
            "MDF is heavy - get help lifting",
            "Prime MDF edges thoroughly or they soak up paint",
            "Crown molding is trickier than it looks"
        ],
        "tips": [
            "Use a laser level for shelf pin holes",
            "Scribe to wall for built-in look",
            "Add lighting for display highlight"
        ],
        "likes": 203,
        "comments": 29,
        "featured": True,
        "created_at": "2024-04-05T16:45:00"
    },
    {
        "id": "post_005",
        "title": "My First Cabinet - Beginner Success!",
        "description": "Started with no experience, built this simple base cabinet in a weekend. So proud!",
        "author": "Tom B.",
        "author_id": "user_005",
        "project_type": "base_cabinet",
        "style": "simple",
        "dimensions": {"width": 24, "height": 34.5, "depth": 24},
        "materials": ["3/4\" Plywood", "Pocket Hole Screws"],
        "hardware": ["Basic Euro Hinges", "Shelf Pins"],
        "images": ["/gallery/first1.jpg"],
        "cost_breakdown": {"materials": 65, "hardware": 25, "total": 90},
        "time_hours": 8,
        "difficulty": "beginner",
        "lessons_learned": [
            "Watched 3 YouTube videos before starting",
            "Pocket hole joinery is beginner-friendly",
            "Measure twice, cut once - I learned this the hard way"
        ],
        "tips": [
            "Start small - build confidence",
            "Use a Kreg jig for easy joinery",
            "Don't stress about perfection on your first build"
        ],
        "likes": 312,
        "comments": 45,
        "featured": True,
        "created_at": "2024-05-01T11:00:00"
    }
]

# Initialize with sample data
for post in SAMPLE_POSTS:
    gallery_posts[post["id"]] = post
    comments_db[post["id"]] = []
    likes_db[post["id"]] = []

@router.get("/posts")
async def list_posts(
    project_type: Optional[str] = None,
    style: Optional[str] = None,
    difficulty: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 20,
    offset: int = 0
) -> Dict[str, Any]:
    """
    List gallery posts with optional filtering.
    """
    posts = list(gallery_posts.values())
    
    # Apply filters
    if project_type:
        posts = [p for p in posts if p.get("project_type") == project_type]
    if style:
        posts = [p for p in posts if p.get("style") == style]
    if difficulty:
        posts = [p for p in posts if p.get("difficulty") == difficulty]
    if featured is not None:
        posts = [p for p in posts if p.get("featured") == featured]
    
    # Sort by date (newest first)
    posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Paginate
    total = len(posts)
    posts = posts[offset:offset + limit]
    
    return {
        "posts": posts,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + limit < total
    }

@router.get("/posts/{post_id}")
async def get_post(post_id: str) -> Dict[str, Any]:
    """Get detailed post information"""
    if post_id not in gallery_posts:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post = gallery_posts[post_id].copy()
    post["comments_list"] = comments_db.get(post_id, [])
    
    return post

@router.post("/posts")
async def create_post(post: NewPost) -> Dict[str, Any]:
    """Create a new gallery post"""
    post_id = f"post_{uuid.uuid4().hex[:8]}"
    
    new_post = {
        "id": post_id,
        "title": post.title,
        "description": post.description,
        "author": post.author,
        "author_id": post.author_id,
        "project_type": post.project_type,
        "style": post.style,
        "dimensions": {
            "width": post.width,
            "height": post.height,
            "depth": post.depth
        },
        "materials": post.materials,
        "hardware": post.hardware,
        "images": [],
        "cost_breakdown": {
            "materials": post.cost_materials,
            "hardware": post.cost_hardware,
            "total": post.cost_total
        },
        "time_hours": post.time_hours,
        "difficulty": post.difficulty,
        "lessons_learned": post.lessons_learned,
        "tips": post.tips,
        "likes": 0,
        "comments": 0,
        "featured": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    gallery_posts[post_id] = new_post
    comments_db[post_id] = []
    likes_db[post_id] = []
    
    return {
        "post_id": post_id,
        "message": "Post created successfully",
        "post": new_post
    }

@router.post("/posts/{post_id}/like")
async def like_post(post_id: str, user_id: str) -> Dict[str, Any]:
    """Like a post"""
    if post_id not in gallery_posts:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if user_id in likes_db[post_id]:
        # Unlike
        likes_db[post_id].remove(user_id)
        gallery_posts[post_id]["likes"] -= 1
        liked = False
    else:
        # Like
        likes_db[post_id].append(user_id)
        gallery_posts[post_id]["likes"] += 1
        liked = True
    
    return {
        "post_id": post_id,
        "liked": liked,
        "likes": gallery_posts[post_id]["likes"]
    }

@router.post("/posts/{post_id}/comment")
async def add_comment(post_id: str, comment: Comment) -> Dict[str, Any]:
    """Add a comment to a post"""
    if post_id not in gallery_posts:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_comment = {
        "id": f"comment_{uuid.uuid4().hex[:8]}",
        "author": comment.author,
        "author_id": comment.author_id,
        "content": comment.content,
        "created_at": datetime.utcnow().isoformat()
    }
    
    comments_db[post_id].append(new_comment)
    gallery_posts[post_id]["comments"] += 1
    
    return {
        "comment_id": new_comment["id"],
        "message": "Comment added",
        "comment": new_comment
    }

@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str) -> List[Dict[str, Any]]:
    """Get all comments for a post"""
    if post_id not in gallery_posts:
        raise HTTPException(status_code=404, detail="Post not found")
    return comments_db.get(post_id, [])

@router.get("/featured")
async def get_featured_posts(limit: int = 5) -> List[Dict[str, Any]]:
    """Get featured posts"""
    featured = [p for p in gallery_posts.values() if p.get("featured")]
    featured.sort(key=lambda x: x.get("likes", 0), reverse=True)
    return featured[:limit]

@router.get("/search")
async def search_posts(
    query: str,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Search posts by title, description, or materials"""
    query_lower = query.lower()
    results = []
    
    for post in gallery_posts.values():
        if (query_lower in post.get("title", "").lower() or
            query_lower in post.get("description", "").lower() or
            any(query_lower in m.lower() for m in post.get("materials", []))):
            results.append(post)
    
    return results[:limit]

@router.get("/stats")
async def get_gallery_stats() -> Dict[str, Any]:
    """Get gallery statistics"""
    posts = list(gallery_posts.values())
    
    # Calculate stats
    total_posts = len(posts)
    total_likes = sum(p.get("likes", 0) for p in posts)
    total_comments = sum(p.get("comments", 0) for p in posts)
    
    # Project type distribution
    project_types = {}
    for p in posts:
        pt = p.get("project_type", "other")
        project_types[pt] = project_types.get(pt, 0) + 1
    
    # Style distribution
    styles = {}
    for p in posts:
        s = p.get("style", "other")
        styles[s] = styles.get(s, 0) + 1
    
    # Average cost and time
    avg_cost = sum(p.get("cost_breakdown", {}).get("total", 0) for p in posts) / max(total_posts, 1)
    avg_time = sum(p.get("time_hours", 0) for p in posts) / max(total_posts, 1)
    
    return {
        "total_posts": total_posts,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "project_types": project_types,
        "styles": styles,
        "average_cost": round(avg_cost, 2),
        "average_time_hours": round(avg_time, 1)
    }

@router.get("/categories")
async def get_categories() -> Dict[str, List[str]]:
    """Get all available project types and styles"""
    posts = list(gallery_posts.values())
    
    project_types = list(set(p.get("project_type", "") for p in posts))
    styles = list(set(p.get("style", "") for p in posts))
    difficulties = list(set(p.get("difficulty", "") for p in posts))
    
    return {
        "project_types": sorted(project_types),
        "styles": sorted(styles),
        "difficulties": sorted(difficulties)
    }

@router.get("/user/{user_id}")
async def get_user_posts(user_id: str) -> List[Dict[str, Any]]:
    """Get all posts by a specific user"""
    user_posts = [
        p for p in gallery_posts.values()
        if p.get("author_id") == user_id
    ]
    user_posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return user_posts

@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user_id: str) -> Dict[str, str]:
    """Delete a post (only by author)"""
    if post_id not in gallery_posts:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post = gallery_posts[post_id]
    if post.get("author_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    del gallery_posts[post_id]
    del comments_db[post_id]
    del likes_db[post_id]
    
    return {"message": f"Post {post_id} deleted"}
