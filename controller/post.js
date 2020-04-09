const Post = require('../models/post')

exports.search = async (req, res) => {
    const query = req.query.search
    if (query) {
        console.log(query)
        const post = await Post.find({
            $or: [
                {
                    title: { $regex: '.*' + query + '.*', $options: 'i' }
                },
                {
                    'detail.nearby': { $regex: '.*' + query + '.*', $options: 'i' }        
                }
            ]
        }).select({ comments: 0, available: 0, detail: 0, created: 0, __v: 0})
        if (post.length === 0) {
            return res.status(200).json({ post: 'No have post' })
        }
        res.status(200).json(post)
    } else {
        const posts = await Post.find().sort({ created: -1 })
        if (posts.length === 0) {
            return res.status(200).json({ post: 'No have post' })
        }
        res.status(200).json(posts)
    }
}

exports.recommend = async (req, res) => {
    const posts = await Post.find({
        'rate.rating': { $gte: 4 }
    }).select({ comments: 0, available: 0, detail: 0, created: 0, __v: 0})
    if (posts.length === 0) {
        return res.status(200).json({ post: 'No have post' })
    }
    res.status(200).json(posts)
}