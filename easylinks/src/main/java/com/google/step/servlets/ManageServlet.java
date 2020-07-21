package com.google.step.servlets;

import com.google.step.servlets.ServletHelper;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responsible for managing links. */
@WebServlet("/data")
public class ManageServlet extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    final String email = ServletHelper.USERSERVICE.getCurrentUser().getEmail();
    // Define a query rule that retreives records based on email and 
    // sorts links in alphabetically by shortcut
    Filter emailFilter =
        new FilterPredicate("email", FilterOperator.EQUAL, email);
    Query query = new Query("Link")
                      .setFilter(emailFilter)
                      .addSort("shortcut", SortDirection.ASCENDING);
    PreparedQuery results = ServletHelper.DEFAULT_DATASTORE_SERVICE.prepare(query);

    response.setContentType("application/json;");
    response.getWriter().println(ServletHelper.convertToJson(results.asList()));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
    final String action = ServletHelper.getParameterWithDefault(request, "action", "");
    if (action.equals("delete") ){
      long id = Long.parseLong(request.getParameter("id"));
      Key linkEntityKey = KeyFactory.createKey("Link", id);
      ServletHelper.DEFAULT_DATASTORE_SERVICE.delete(linkEntityKey);
    }
  }
}