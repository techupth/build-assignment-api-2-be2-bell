import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json())

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

// ---------------get---------------
app.get("/assignments", async(req, res) => {
  try {
    const results = await connectionPool.query(`select * from assignments`) 
    return res.status(200).json({
      data: results.rows,
    })
  } catch (error) {
    console.log("database error", error)
    return res.status(500).json({ 
      "message": "Server could not read assignment because database connection"
     })
  }
})

// ---------------get-id---------------
app.get("/assignments/:assignmentId", async(req, res) => {
  try {
  const assignIdFromClient = req.params.assignmentId
  const results = await connectionPool.query(
    `select * from assignments where assignment_id=$1`, [assignIdFromClient]
  )

  if(!results.rows[0]){
    return res.status(404).json({
      "message": `Server could not find a requested assignment(assignment_id: ${assignIdFromClient})`
    })
  }

  return res.status(200).json({
    data: results.rows[0],
  })
  } catch (error) {
    console.log("database error", error)
    return res.status(500).json({ 
      "message": "Server could not read assignment because database connection" 
    })
  }  
})

// ---------------post---------------
app.post("/assignments/", async(req, res) => {
  const  newAssign = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  }

  try {
    const createAssign = await connectionPool.query(
      `insert into assignments (user_id, title, content, category, length, created_at, updated_at, published_at, status)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        1,
        newAssign.title,
        newAssign.content,
        newAssign.category,
        newAssign.length,
        newAssign.created_at,
        newAssign.updated_at,
        newAssign.published_at,
        newAssign.status,
      ]
    )

    if(!createAssign){
      return res.status(404).json({ 
        "message": "Server could not create assignment because there are missing data from client" 
      })
    }
  
    return res.status(201).json({ 
      "message": "Created assignment sucessfully" 
    })

  } catch (error) {
    console.log("database error", error)
    return res.status(500).json({ 
      "message": "Server could not create assignment because database connection" 
    })
  }
})

// ---------------put---------------
app.put("/assignments/:assignmentId", async(req, res) => {
  try {
  const assignIdFromClient = req.params.assignmentId
  const updateAssign = { ...req.body, updated_at: new Date()}

  await connectionPool.query(
    `update assignments
     set title = $2,
     content = $3,
     category = $4,
     length = $5,
     status = $6,
     updated_at = $7
     where assignment_id = $1
    `,
    [
      assignIdFromClient,
      updateAssign.title,
      updateAssign.content,
      updateAssign.category,
      updateAssign.length,
      updateAssign.status,
      updateAssign.updated_at
    ]
  )

  if(!updateAssign){
    return res.status(404).json({
      "message": "Server could not find a requested assignment to update"
    })
  }

  return res.status(200).json({
     "message": "Updated assignment sucessfully" 
    })

  } catch (error) {
    console.log("database error", error)
    return res.status(500).json({ 
      "message": "Server could not update assignment because database connection"
    })
  }
})

// ---------------delete---------------
app.delete("/assignments/:assignmentId", async(req, res) => {
  try {
  const assignIdFromClient = req.params.assignmentId

  const deleteAssign = await connectionPool.query(
    `delete from assignments
    where assignment_id = $1`, [assignIdFromClient]
  )

  if(!deleteAssign){
    return res.status(404).json({ 
      "message": "Server could not find a requested assignment to delete" 
    })
  }

  return res.status(200).json({ 
    "message": "Deleted assignment sucessfully" 
  })
  } catch (error) {
    console.log("database error", error)
    return res.status(500).json({ 
      "message": "Server could not delete assignment because database connection" 
    })
  }

})


app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});



