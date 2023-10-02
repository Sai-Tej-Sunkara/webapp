const express = require("express");
const user_authentication = require("../user-authenticator/user-authenticator");
const router = express.Router();

const {sequelize, User, Assignment} = require("../sequelize");

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.get("/assignments", async (req, res)=>{
    if(!req.headers.authorization)
   {
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }
    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        if(req.headers["content-length"]>0) {
            res.status(400).send({Status: 400, message:"Please check your headers. Body has some data in get request, which is not valid."});
            return;
        }
        if(Object.keys(req.query).length > 0 ) {
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        let user_id_validated = validation.user;
        try {
            const assignments = await Assignment.findAll({
              where: {
                user_id: user_id_validated,
              },
            });
        
            res.status(200).send(assignments);
          } 
          catch (error) {
            console.error(error);
          }
    }
    else {
        res.status(401);
        res.send({"Status": 401, "Message": validation.message});
    }
})

router.post("/assignments", async (req, res)=>{
    if(!req.headers.authorization)
   {
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }
    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        let user_id_validated = validation.user;
        if(Object.keys(req.query).length > 0 ) {
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        if(Object.keys(req.body).length==0) {
            res.status(400);
            res.send({"Status": 400, "Message": "Request Body only Supports JSON format and need to have all fields"});
        }
        let keys = Object.keys(req.body);
        keys.map((key)=>{
            if(!(key=="name" || key=="points" || key=="num_of_attemps" || key=="deadline")) {
                res.status(400);
                res.send({"Status": 400, "Message": key+" is not valid parameter to pass to body"});
            }
        })
        let values = Object.values(req.body);
        values.map((value)=>{
            if(value==null || value==undefined || value=="") {
                res.status(400);
                res.send({"Status": 400, "Message": "One or More Values given in keys of body are not supported"});
            }
        })
        try {
            const deadlineDate = new Date(req.body.deadline);
            const currentDate = new Date();
            if(req.body.name.trim()=="" || typeof req.body.name != "string") {
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment name in body!"});
            }
            else if(req.body.points<0 || req.body.points>10 || typeof req.body.points != "number") {
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment points in body!"});
            }
            else if(req.body.num_of_attemps<0 || typeof req.body.num_of_attemps != "number") {
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment attemps in body!"});
            }
            else if(isNaN(deadlineDate.getTime()) || deadlineDate <= currentDate) {
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment deadline in body! - Deadline isn't matching date or deadline is past date"});
            }
            else {
                const newAssignment = {
                    name: req.body.name,
                    points: req.body.points,
                    num_of_attemps: req.body.num_of_attemps,
                    deadline: new Date(req.body.deadline),
                    user_id: user_id_validated
                  };
                  
                  for (const key in newAssignment) {
                    if (key !== "name" && key !== "points" && key !== "num_of_attemps" && key !== "deadline" && key !== "user_id") {
                      delete newAssignment[key];
                    }
                  }

                const createdAssignment = await Assignment.create(newAssignment);
                res.status(201).send({ "Status": 201, "Message": "Assignment created successfully" });
            }
        } 
        catch (error) {
            console.error(error);
        }
    }
    else {
        res.status(401);
        res.send({"Status": 401, "Message": validation.message});
    }
})

router.get("/assignments/:id", async (req, res)=>{
    if(!req.headers.authorization)
   {
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }
    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        if(req.headers["content-length"]>0) {
            res.status(400).send({Status: 400, message:"Please check your headers. Body has some data in get request, which is not valid."});
            return;
        }
        if(Object.keys(req.query).length > 0 ) {
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        let assignment_id = req.params.id;
        let user_id_validated = validation.user;
        console.log(assignment_id, user_id_validated);
        try {
            const assignments = await Assignment.findAll({
              where: {
                user_id: user_id_validated,
                id: assignment_id
              },
            });

            if(assignments.length>0) {
                res.status(200).send(assignments);
            }
            else {
                const assignments_check_1 = await Assignment.findAll({
                    where: {
                      id: assignment_id
                    },
                  });
                if(assignments_check_1.length > 0) {
                    res.status(403).send({Status: 403, message: "Forbidden to access others assignemnts!"});
                }
                else {
                    res.status(404).send({Status: 404, message: "No Records Found with "+id+" in your assignments"});
                }
            }
            
          } 
          catch (error) {
            console.error(error);
          }
    }
    else {
        res.status(401);
        res.send({"Status": 401, "Message": validation.message});
    }
})

router.delete("/assignments/:id", async (req, res)=>{
    if(!req.headers.authorization)
   {
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }
    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        if(req.headers["content-length"]>0) {
            res.status(400).send({Status: 400, message:"Please check your headers. Body has some data in get request, which is not valid."});
            return;
        }
        if(Object.keys(req.query).length > 0 ) {
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        let assignment_id = req.params.id;
        let user_id_validated = validation.user;
        console.log(assignment_id, user_id_validated);
        try {
            const assignments = await Assignment.findAll({
              where: {
                user_id: user_id_validated,
                id: assignment_id
              },
            });

            if(assignments.length>0) {
                try {
                    await Promise.all(
                        assignments.map(async (assignment) => {
                        await assignment.destroy();
                      })
                    );
              
                    res.status(204).send({ Status: 204, message: "Content Deleted Successfully!" });
                  } catch (error) {
                    console.error(error);
                  }
            }
            else {
                const assignments_check_1 = await Assignment.findAll({
                    where: {
                      id: assignment_id
                    },
                  });
                if(assignments_check_1.length > 0) {
                    res.status(403).send({Status: 403, message: "Forbidden to delete others assignemnts!"});
                }
                else {
                    res.status(404).send({Status: 404, message: "No Records Found with "+id+" in your assignments"});
                }
            }
            
          } 
          catch (error) {
            console.error(error);
          }
    }
    else {
        res.status(401);
        res.send({"Status": 401, "Message": validation.message});
    }
})

router.put("/assignments/:id", async (req, res)=>{
    if(!req.headers.authorization)
   {
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }

    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        if(Object.keys(req.query).length > 0 ) {
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        let assignment_id = req.params.id;
        let user_id_validated = validation.user;
        console.log(assignment_id, user_id_validated);

        if(Object.keys(req.body).length==0) {
            res.status(400);
            res.send({"Status": 400, "Message": "Request Body only Supports JSON format and need to have all fields"});
        }
        let keys = Object.keys(req.body);
        keys.map((key)=>{
            if(!(key=="name" || key=="points" || key=="num_of_attemps" || key=="deadline")) {
                res.status(400);
                res.send({"Status": 400, "Message": key+" is not valid parameter to pass to body"});
            }
        })
        let values = Object.values(req.body);
        values.map((value)=>{
            if(value==null || value==undefined || value=="") {
                res.status(400);
                res.send({"Status": 400, "Message": "One or More Values given in keys of body are not supported"});
            }
        })

        try {

            const deadlineDate = new Date(req.body.deadline);
            const currentDate = new Date();
            if(req.body.name.trim()=="" || typeof req.body.name != "string") {
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment name in body!"});
            }
            else if(req.body.points<0 || req.body.points>10 || typeof req.body.points != "number") {
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment points in body!"});
            }
            else if(req.body.num_of_attemps<0 || typeof req.body.num_of_attemps != "number") {
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment attemps in body!"});
            }
            else if(isNaN(deadlineDate.getTime()) || deadlineDate <= currentDate) {
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment deadline in body! - Deadline isn't matching date or deadline is past date"});
            }
            else {
                const newAssignment = {
                    name: req.body.name,
                    points: req.body.points,
                    num_of_attemps: req.body.num_of_attemps,
                    deadline: new Date(req.body.deadline),
                    user_id: user_id_validated
                  };
                  
                  for (const key in newAssignment) {
                    if (key !== "name" && key !== "points" && key !== "num_of_attemps" && key !== "deadline" && key !== "user_id") {
                      delete newAssignment[key];
                    }
                  }

                  const assignments = await Assignment.findAll({
                    where: {
                      user_id: user_id_validated,
                      id: assignment_id
                    },
                  });
      
                  if(assignments.length>0) {
                      try {

                        const assignmentToUpdate = await Assignment.findOne({
                        where: {
                            user_id: user_id_validated,
                            id: assignment_id
                        },
                        });
                        if (!assignmentToUpdate) {
                        res.status(404).send({ "Status": 404, "Message": "Assignment not found" });
                        return;
                        }
                        assignmentToUpdate.name = newAssignment.name;
                        assignmentToUpdate.points = newAssignment.points;
                        assignmentToUpdate.num_of_attemps = newAssignment.num_of_attemps;
                        assignmentToUpdate.deadline = newAssignment.deadline;

                        await assignmentToUpdate.save();
                        res.status(200).send({ "Status": 200, "Message": "Assignment updated successfully" });
                        } catch (error) {
                            console.error(error);
                        }
                  }
                  else {
                      const assignments_check_1 = await Assignment.findAll({
                          where: {
                            id: assignment_id
                          },
                        });
                      if(assignments_check_1.length > 0) {
                          res.status(403).send({Status: 403, message: "Forbidden to update others assignemnts!"});
                      }
                      else {
                          res.status(404).send({Status: 404, message: "No Records Found with "+id+" in your assignments"});
                      }
                  }
            }
            
          } 
          catch (error) {
            console.error(error);
          }
    }
    else {
        res.status(401);
        res.send({"Status": 401, "Message": validation.message});
    }
})

module.exports = router;